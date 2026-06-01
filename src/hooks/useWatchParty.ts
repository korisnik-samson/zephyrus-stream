"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import type {
  ChatMessage, PartyEvent, PartyMember, WatchPartyState,
} from "@/types/watchParty";

interface UseWatchPartyOptions {
  partyId: string;
  self: PartyMember;
  /** Called when a remote playback event arrives (host → guests) */
  onRemoteEvent?: (event: Extract<PartyEvent, { type: "play" | "pause" | "seek" }>) => void;
}

function wsUrl(partyId: string): string | null {
  const base =
    process.env.NEXT_PUBLIC_WS_URL ??
    (typeof window !== "undefined"
      ? window.location.origin.replace(/^http/, "ws")
      : null);
  return base ? `${base}/ws/party/${partyId}` : null;
}

/**
 * Watch-party sync over WebSocket with graceful degradation:
 * if the socket can't connect, chat still works locally (single-user preview).
 */
export function useWatchParty({ partyId, self, onRemoteEvent }: UseWatchPartyOptions) {
  const socketRef = useRef<WebSocket | null>(null);
  const [state, setState] = useState<WatchPartyState>({
    connected: false,
    members: [self],
    messages: [],
  });

  const pushMessage = useCallback((message: ChatMessage) => {
    setState((s) => ({ ...s, messages: [...s.messages, message] }));
  }, []);

  // ── Connect ───────────────────────────────────────────────
  useEffect(() => {
    const url = wsUrl(partyId);
    if (!url) return;

    let socket: WebSocket;
    try {
      socket = new WebSocket(url);
    } catch {
      return;
    }
    socketRef.current = socket;

    socket.onopen = () => {
      setState((s) => ({ ...s, connected: true }));
      socket.send(JSON.stringify({ type: "join", member: self }));
    };

    socket.onclose = () => setState((s) => ({ ...s, connected: false }));
    socket.onerror = () => setState((s) => ({ ...s, connected: false }));

    socket.onmessage = (raw) => {
      let event: PartyEvent;
      try { event = JSON.parse(raw.data); } catch { return; }

      switch (event.type) {
        case "chat":
          pushMessage(event.message);
          break;
        case "members":
          setState((s) => ({ ...s, members: event.members }));
          break;
        case "join":
          setState((s) => ({
            ...s,
            members: s.members.some((m) => m.id === event.member.id)
              ? s.members
              : [...s.members, event.member],
            messages: [...s.messages, sysMsg(`${event.member.name} joined`)],
          }));
          break;
        case "leave":
          setState((s) => ({
            ...s,
            members: s.members.filter((m) => m.id !== event.memberId),
          }));
          break;
        case "play":
        case "pause":
        case "seek":
          onRemoteEvent?.(event);
          break;
      }
    };

    return () => {
      socket.close();
      socketRef.current = null;
    };
  }, [partyId, self, pushMessage, onRemoteEvent]);

  // ── Send helpers ──────────────────────────────────────────
  const send = useCallback((event: PartyEvent) => {
    const socket = socketRef.current;
    if (socket?.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify(event));
    }
  }, []);

  const sendChat = useCallback((text: string) => {
    const message: ChatMessage = {
      id: crypto.randomUUID(),
      memberId: self.id,
      memberName: self.name,
      text,
      timestamp: Date.now(),
    };
    pushMessage(message); // optimistic local echo
    send({ type: "chat", message });
  }, [self, pushMessage, send]);

  const broadcastPlayback = useCallback(
    (type: "play" | "pause" | "seek", time: number) => {
      if (self.isHost) send({ type, time });
    },
    [self.isHost, send]
  );

  return { ...state, sendChat, broadcastPlayback };
}

function sysMsg(text: string): ChatMessage {
  return {
    id: crypto.randomUUID(),
    memberId: "system",
    memberName: "System",
    text,
    timestamp: Date.now(),
    system: true,
  };
}
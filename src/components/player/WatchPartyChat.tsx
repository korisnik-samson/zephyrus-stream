"use client";

import { useRef, useState, useEffect } from "react";
import { Send, Users, Crown, Wifi, WifiOff, X } from "lucide-react";
import { cn, getInitials } from "@/lib/utils";
import type { ChatMessage, PartyMember } from "@/types/watchParty";

interface WatchPartyChatProps {
  connected: boolean;
  members: PartyMember[];
  messages: ChatMessage[];
  selfId: string;
  onSend: (text: string) => void;
  onClose?: () => void;
}

export default function WatchPartyChat({
  connected, members, messages, selfId, onSend, onClose,
}: WatchPartyChatProps) {
  const [draft, setDraft] = useState("");
  const [tab, setTab] = useState<"chat" | "members">("chat");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const text = draft.trim();
    if (!text) return;
    onSend(text);
    setDraft("");
  };

  return (
    <aside className="flex flex-col h-full w-full bg-bg-secondary border-l border-border">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-bold text-text-primary">Watch Party</h2>
          <span className={cn(
            "flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full",
            connected ? "bg-accent-green/15 text-accent-green" : "bg-accent-gold/15 text-accent-gold"
          )}>
            {connected ? <Wifi className="h-2.5 w-2.5" /> : <WifiOff className="h-2.5 w-2.5" />}
            {connected ? "Live" : "Connecting"}
          </span>
        </div>
        {onClose && (
          <button onClick={onClose} className="lg:hidden text-text-muted hover:text-text-primary">
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border">
        <button
          onClick={() => setTab("chat")}
          className={cn(
            "flex-1 py-2.5 text-xs font-medium transition-colors",
            tab === "chat" ? "text-text-primary border-b-2 border-accent-purple" : "text-text-muted hover:text-text-secondary"
          )}
        >
          Chat
        </button>
        <button
          onClick={() => setTab("members")}
          className={cn(
            "flex-1 py-2.5 text-xs font-medium transition-colors flex items-center justify-center gap-1.5",
            tab === "members" ? "text-text-primary border-b-2 border-accent-purple" : "text-text-muted hover:text-text-secondary"
          )}
        >
          <Users className="h-3.5 w-3.5" />
          {members.length}
        </button>
      </div>

      {/* Chat tab */}
      {tab === "chat" ? (
        <>
          <div ref={scrollRef} className="flex-1 overflow-y-auto scrollbar-hide px-3 py-3 space-y-2.5">
            {messages.length === 0 && (
              <p className="text-center text-xs text-text-muted py-8">
                No messages yet. Say hi! 👋
              </p>
            )}
            {messages.map((msg) =>
              msg.system ? (
                <p key={msg.id} className="text-center text-[11px] text-text-muted italic py-1">
                  {msg.text}
                </p>
              ) : (
                <div
                  key={msg.id}
                  className={cn("flex flex-col", msg.memberId === selfId ? "items-end" : "items-start")}
                >
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className="text-[11px] font-semibold text-text-secondary">
                      {msg.memberId === selfId ? "You" : msg.memberName}
                    </span>
                  </div>
                  <div className={cn(
                    "max-w-[85%] px-3 py-1.5 rounded-2xl text-sm",
                    msg.memberId === selfId
                      ? "bg-accent-purple text-white rounded-br-sm"
                      : "bg-bg-elevated text-text-primary rounded-bl-sm"
                  )}>
                    {msg.text}
                  </div>
                </div>
              )
            )}
          </div>

          {/* Input */}
          <form onSubmit={submit} className="p-3 border-t border-border flex items-center gap-2">
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Send a message…"
              maxLength={300}
              className="flex-1 h-9 px-3 rounded-xl bg-bg-card border border-border text-sm text-text-primary placeholder:text-text-muted outline-none focus:border-accent-purple"
            />
            <button
              type="submit"
              disabled={!draft.trim()}
              className="h-9 w-9 rounded-xl bg-gradient-purple-btn text-white flex items-center justify-center disabled:opacity-40 transition-opacity"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </>
      ) : (
        /* Members tab */
        <div className="flex-1 overflow-y-auto scrollbar-hide px-3 py-3 space-y-1">
          {members.map((member) => (
            <div key={member.id} className="flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-bg-elevated transition-colors">
              <div className="relative h-9 w-9 rounded-full bg-accent-purple flex items-center justify-center text-xs font-semibold text-white flex-shrink-0">
                {getInitials(member.name)}
              </div>
              <span className="flex-1 text-sm text-text-primary">
                {member.id === selfId ? `${member.name} (You)` : member.name}
              </span>
              {member.isHost && (
                <span className="flex items-center gap-1 text-[10px] font-bold text-accent-gold">
                  <Crown className="h-3 w-3 fill-current" />
                  HOST
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </aside>
  );
}
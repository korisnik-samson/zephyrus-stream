export interface PartyMember {
  id: string;
  name: string;
  avatarUrl: string | null;
  isHost: boolean;
}

export interface ChatMessage {
  id: string;
  memberId: string;
  memberName: string;
  text: string;
  timestamp: number;
  /** System messages (joins, leaves, sync events) render differently */
  system?: boolean;
}

export type PartyEvent =
  | { type: "play"; time: number }
  | { type: "pause"; time: number }
  | { type: "seek"; time: number }
  | { type: "chat"; message: ChatMessage }
  | { type: "join"; member: PartyMember }
  | { type: "leave"; memberId: string }
  | { type: "members"; members: PartyMember[] };

export interface WatchPartyState {
  connected: boolean;
  members: PartyMember[];
  messages: ChatMessage[];
}
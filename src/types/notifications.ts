export type NotificationType =
  | "NEW_RELEASE"
  | "CONTINUE_WATCHING"
  | "RECOMMENDATION"
  | "SYSTEM";

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  imageUrl?: string;
  actionUrl?: string;
  read: boolean;
  createdAt: string;
}
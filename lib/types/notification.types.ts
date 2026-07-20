export type NotificationType =
  | "JOIN_REQUEST_APPROVED"
  | "JOIN_REQUEST_REJECTED"
  | "CLUB_JOINED"
  | "READING_CYCLE_STARTED"
  | "READING_CYCLE_UPDATED"
  | "READING_TARGET_UPCOMING"
  | "VOTING_OPENED"
  | "VOTING_CLOSED"
  | "DISCUSSION_TOPIC_CREATED"
  | "DISCUSSION_REPLY"
  | "READING_ENTRY_CREATED";

export type NotificationEntityType =
  | "CLUB"
  | "JOIN_REQUEST"
  | "READING_CYCLE"
  | "READING_TARGET"
  | "DISCUSSION_TOPIC"
  | "DISCUSSION_POST"
  | "BOOK_VOTE"
  | "READING_ENTRY";

export type NotificationActor = {
  id: string;
  displayName: string;
  avatarUrl: string | null;
};

export type AppNotification = {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  actionUrl: string;
  isRead: boolean;
  createdAt: string;
  readAt: string | null;
  actor: NotificationActor | null;
  clubId: string | null;
  entityId: string | null;
  entityType: NotificationEntityType | null;
};

export type NotificationPage = {
  items: AppNotification[];
  pagination: {
    nextCursor: string | null;
    hasMore: boolean;
  };
};

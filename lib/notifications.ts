import {
  NotificationPageSchema,
  NotificationSchema,
  UnreadNotificationCountSchema,
} from "@/lib/contracts/notification.contract";
import { getJson, patchJson } from "@/lib/api";
import type { AppNotification, NotificationPage } from "@/lib/types";

type NotificationQuery = {
  cursor?: string | null;
  limit?: number;
  unreadOnly?: boolean;
};

function buildNotificationQuery(query: NotificationQuery = {}) {
  const params = new URLSearchParams();

  if (query.cursor) params.set("cursor", query.cursor);
  if (query.limit) params.set("limit", String(query.limit));
  if (query.unreadOnly !== undefined) {
    params.set("unreadOnly", String(query.unreadOnly));
  }

  const search = params.toString();
  return search ? `?${search}` : "";
}

export async function getNotifications(
  query: NotificationQuery = {},
): Promise<NotificationPage> {
  const data = await getJson<NotificationPage>(
    `/notifications${buildNotificationQuery(query)}`,
  );
  return NotificationPageSchema.parse(data);
}

export async function getUnreadNotificationCount(): Promise<number> {
  const data = await getJson<{ unreadCount: number }>(
    "/notifications/unread-count",
  );
  return UnreadNotificationCountSchema.parse(data).unreadCount;
}

export async function markNotificationRead(
  notificationId: string,
): Promise<AppNotification> {
  const data = await patchJson<AppNotification, Record<string, never>>(
    `/notifications/${notificationId}/read`,
    {},
  );
  return NotificationSchema.parse(data);
}

export async function markAllNotificationsRead(): Promise<void> {
  await patchJson<{ message: string }, Record<string, never>>(
    "/notifications/read-all",
    {},
  );
}

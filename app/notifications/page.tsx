"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Bell, Check, CheckCheck, Loader2, RefreshCw } from "lucide-react";

import { AppHeader } from "@/components/layout/AppHeader";
import { ErrorState } from "@/components/ui/app-primitives";
import { useAuthState } from "@/hooks/useAuthState";
import {
  getNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "@/lib/notifications";
import type { AppNotification } from "@/lib/types";

function formatFullTime(value: string) {
  return new Date(value).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function NotificationsPage() {
  const router = useRouter();
  const { isAuthenticated, isReady, logout, user } = useAuthState();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isMarkingAll, setIsMarkingAll] = useState(false);
  const [error, setError] = useState("");

  const userInitial = user?.name?.charAt(0).toUpperCase() ?? "R";

  const loadNotifications = useCallback(async () => {
    try {
      setIsLoading(true);
      setError("");
      const page = await getNotifications({ limit: 20 });
      setNotifications(page.items);
      setNextCursor(page.pagination.nextCursor);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to load notifications",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isReady) return;

    if (!isAuthenticated) {
      router.replace("/auth/login?returnTo=/notifications");
      return;
    }

    void loadNotifications();
  }, [isAuthenticated, isReady, loadNotifications, router]);

  const handleLoadMore = async () => {
    if (!nextCursor) return;

    try {
      setIsLoadingMore(true);
      const page = await getNotifications({ cursor: nextCursor, limit: 20 });
      setNotifications((items) => [...items, ...page.items]);
      setNextCursor(page.pagination.nextCursor);
    } finally {
      setIsLoadingMore(false);
    }
  };

  const handleOpen = async (notification: AppNotification) => {
    if (!notification.isRead) {
      setNotifications((items) =>
        items.map((item) =>
          item.id === notification.id
            ? { ...item, isRead: true, readAt: new Date().toISOString() }
            : item,
        ),
      );
      void markNotificationRead(notification.id);
    }

    router.push(notification.actionUrl);
  };

  const handleMarkOneRead = async (notificationId: string) => {
    setNotifications((items) =>
      items.map((item) =>
        item.id === notificationId
          ? { ...item, isRead: true, readAt: new Date().toISOString() }
          : item,
      ),
    );
    await markNotificationRead(notificationId);
  };

  const handleMarkAll = async () => {
    try {
      setIsMarkingAll(true);
      await markAllNotificationsRead();
      setNotifications((items) =>
        items.map((item) => ({
          ...item,
          isRead: true,
          readAt: item.readAt ?? new Date().toISOString(),
        })),
      );
    } finally {
      setIsMarkingAll(false);
    }
  };

  return (
    <main className="app-page">
      <AppHeader
        mode="app"
        isAuthenticated={isAuthenticated}
        isAuthReady={isReady}
        userInitial={userInitial}
        onLogout={logout}
      />

      <section className="app-container max-w-5xl">
        <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="app-kicker">Reader inbox</p>
            <h1 className="font-serif text-4xl text-[var(--app-text-primary)] sm:text-5xl">
              Notifications
            </h1>
          </div>
          <button
            type="button"
            className="app-button-secondary w-full sm:w-auto"
            onClick={handleMarkAll}
            disabled={isMarkingAll || notifications.every((item) => item.isRead)}
          >
            {isMarkingAll ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <CheckCheck className="h-4 w-4" />
            )}
            Mark all read
          </button>
        </div>

        {isLoading ? (
          <div className="app-surface flex min-h-60 items-center justify-center rounded-2xl text-[var(--app-text-muted)]">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : error ? (
          <ErrorState
            title="Unable to load notifications"
            description={error}
            action={
              <button
                type="button"
                className="app-button-primary"
                onClick={() => void loadNotifications()}
              >
                <RefreshCw className="h-4 w-4" />
                Retry
              </button>
            }
          />
        ) : notifications.length === 0 ? (
          <div className="app-surface rounded-2xl p-8 text-center">
            <Bell className="mx-auto h-8 w-8 text-[var(--app-accent-gold)]" />
            <h2 className="mt-4 font-serif text-3xl text-[var(--app-text-primary)]">
              Nothing new yet
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[var(--app-text-secondary)]">
              Club activity, reading plans, voting, and replies will collect
              here as your circles move.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((notification) => (
              <article
                key={notification.id}
                className="app-surface rounded-2xl p-4 sm:p-5"
              >
                <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <button
                    type="button"
                    className="flex min-w-0 flex-1 gap-3 text-left"
                    onClick={() => void handleOpen(notification)}
                  >
                    <span
                      className={`mt-2 h-3 w-3 shrink-0 rounded-full ${
                        notification.isRead
                          ? "bg-[var(--app-border-subtle)]"
                          : "bg-[var(--app-accent-gold)]"
                      }`}
                      aria-hidden="true"
                    />
                    <span className="min-w-0">
                      <span className="block font-serif text-2xl leading-tight text-[var(--app-text-primary)]">
                        {notification.title}
                      </span>
                      <span className="mt-2 block text-sm leading-6 text-[var(--app-text-secondary)]">
                        {notification.body}
                      </span>
                      <span className="mt-3 block text-xs uppercase tracking-[0.18em] text-[var(--app-text-muted)]">
                        {formatFullTime(notification.createdAt)}
                      </span>
                    </span>
                  </button>
                  {!notification.isRead ? (
                    <button
                      type="button"
                      className="app-button-secondary w-full sm:w-auto"
                      onClick={() => void handleMarkOneRead(notification.id)}
                    >
                      <Check className="h-4 w-4" />
                      Read
                    </button>
                  ) : null}
                </div>
              </article>
            ))}

            {nextCursor ? (
              <div className="pt-3 text-center">
                <button
                  type="button"
                  className="app-button-secondary"
                  onClick={() => void handleLoadMore()}
                  disabled={isLoadingMore}
                >
                  {isLoadingMore ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : null}
                  Load more
                </button>
              </div>
            ) : null}
          </div>
        )}
      </section>
    </main>
  );
}

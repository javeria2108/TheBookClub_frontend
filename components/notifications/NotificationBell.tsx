"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Bell, Check, CheckCheck, Loader2 } from "lucide-react";

import {
  getNotifications,
  getUnreadNotificationCount,
  markAllNotificationsRead,
  markNotificationRead,
} from "@/lib/notifications";
import type { AppNotification } from "@/lib/types";

function formatNotificationTime(value: string) {
  const date = new Date(value);
  const now = Date.now();
  const diffMinutes = Math.floor((now - date.getTime()) / 60000);

  if (diffMinutes < 1) return "Now";
  if (diffMinutes < 60) return `${diffMinutes}m`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h`;

  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

type NotificationBellProps = {
  activation?: "always" | "desktop" | "mobile";
};

function useBreakpointActivation(activation: NotificationBellProps["activation"]) {
  const query =
    activation === "desktop"
      ? "(min-width: 768px)"
      : activation === "mobile"
        ? "(max-width: 767px)"
        : "";

  return useSyncExternalStore(
    (callback) => {
      if (!query || typeof window === "undefined") return () => undefined;
      const mediaQuery = window.matchMedia(query);
      mediaQuery.addEventListener("change", callback);
      return () => mediaQuery.removeEventListener("change", callback);
    },
    () => {
      if (!query || typeof window === "undefined") return true;
      return window.matchMedia(query).matches;
    },
    () => activation !== "mobile",
  );
}

export function NotificationBell({
  activation = "always",
}: NotificationBellProps) {
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const isActive = useBreakpointActivation(activation);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isMarkingAll, setIsMarkingAll] = useState(false);
  const [error, setError] = useState("");

  const loadUnreadCount = useCallback(async () => {
    if (!isActive) return;

    try {
      const count = await getUnreadNotificationCount();
      setUnreadCount(count);
    } catch {
      setUnreadCount(0);
    }
  }, [isActive]);

  const loadPreview = useCallback(async () => {
    try {
      setIsLoading(true);
      setError("");
      const page = await getNotifications({ limit: 6 });
      setNotifications(page.items);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to load notifications",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadUnreadCount();
    const intervalId = window.setInterval(() => {
      void loadUnreadCount();
    }, 60000);

    return () => window.clearInterval(intervalId);
  }, [loadUnreadCount]);

  useEffect(() => {
    if (isOpen && isActive) void loadPreview();
  }, [isActive, isOpen, loadPreview]);

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    if (isOpen && isActive) document.addEventListener("mousedown", handlePointerDown);

    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [isActive, isOpen]);

  if (!isActive) return null;

  const handleOpenNotification = async (notification: AppNotification) => {
    if (!notification.isRead) {
      setNotifications((items) =>
        items.map((item) =>
          item.id === notification.id
            ? { ...item, isRead: true, readAt: new Date().toISOString() }
            : item,
        ),
      );
      setUnreadCount((count) => Math.max(0, count - 1));
      void markNotificationRead(notification.id);
    }

    setIsOpen(false);
    router.push(notification.actionUrl);
  };

  const handleMarkAll = async () => {
    try {
      setIsMarkingAll(true);
      await markAllNotificationsRead();
      setUnreadCount(0);
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
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        className="relative flex h-10 w-10 items-center justify-center rounded-full border border-[var(--app-border-subtle)] bg-[rgba(9,26,22,0.84)] text-[var(--app-text-primary)] transition hover:border-[var(--app-accent-gold)]"
        aria-label="Open notifications"
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        onClick={() => setIsOpen((value) => !value)}
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 ? (
          <span className="absolute -right-1 -top-1 min-w-5 rounded-full bg-[var(--app-accent-gold)] px-1.5 py-0.5 text-[10px] font-bold leading-none text-[#171008]">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        ) : null}
      </button>

      <AnimatePresence>
        {isOpen ? (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className="fixed right-3 top-20 z-50 w-[calc(100vw-24px)] max-w-sm rounded-2xl border border-[var(--app-border-subtle)] bg-[rgba(8,14,12,0.98)] p-3 shadow-[0_24px_64px_rgba(0,0,0,0.5)] backdrop-blur md:absolute md:right-0 md:top-12 md:w-96"
            role="dialog"
            aria-label="Notifications"
          >
            <div className="flex items-center justify-between gap-3 px-1 pb-3">
              <div>
                <p className="font-serif text-xl text-[var(--app-text-primary)]">
                  Notifications
                </p>
                <p className="text-xs text-[var(--app-text-muted)]">
                  {unreadCount} unread
                </p>
              </div>
              <button
                type="button"
                className="app-button-secondary min-h-9 px-3 py-2 text-xs"
                onClick={handleMarkAll}
                disabled={isMarkingAll || unreadCount === 0}
              >
                {isMarkingAll ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <CheckCheck className="h-3.5 w-3.5" />
                )}
                Read all
              </button>
            </div>

            <div className="max-h-[min(420px,calc(100vh-190px))] overflow-y-auto pr-1">
              {isLoading ? (
                <div className="flex min-h-32 items-center justify-center text-[var(--app-text-muted)]">
                  <Loader2 className="h-5 w-5 animate-spin" />
                </div>
              ) : error ? (
                <div className="rounded-xl border border-[rgba(196,95,95,0.45)] bg-[rgba(67,38,33,0.4)] p-4 text-sm text-[var(--app-text-secondary)]">
                  {error}
                </div>
              ) : notifications.length === 0 ? (
                <div className="rounded-xl border border-[var(--app-border-subtle)] bg-[rgba(255,255,255,0.02)] p-5 text-sm text-[var(--app-text-muted)]">
                  You are all caught up.
                </div>
              ) : (
                <div className="space-y-2">
                  {notifications.map((notification) => (
                    <button
                      key={notification.id}
                      type="button"
                      className="w-full rounded-xl border border-[var(--app-border-subtle)] bg-[rgba(13,28,23,0.78)] p-3 text-left transition hover:border-[var(--app-accent-gold)]"
                      onClick={() => void handleOpenNotification(notification)}
                    >
                      <div className="flex min-w-0 items-start gap-3">
                        <span
                          className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${
                            notification.isRead
                              ? "bg-[var(--app-border-subtle)]"
                              : "bg-[var(--app-accent-gold)]"
                          }`}
                          aria-hidden="true"
                        />
                        <span className="min-w-0 flex-1">
                          <span className="flex items-start justify-between gap-3">
                            <span className="line-clamp-2 text-sm font-semibold text-[var(--app-text-primary)]">
                              {notification.title}
                            </span>
                            <span className="shrink-0 text-[11px] text-[var(--app-text-muted)]">
                              {formatNotificationTime(notification.createdAt)}
                            </span>
                          </span>
                          <span className="mt-1 line-clamp-2 text-xs leading-5 text-[var(--app-text-secondary)]">
                            {notification.body}
                          </span>
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              type="button"
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-[var(--app-border-subtle)] px-4 py-3 text-sm font-semibold text-[var(--app-accent-gold)] transition hover:border-[var(--app-accent-gold)]"
              onClick={() => {
                setIsOpen(false);
                router.push("/notifications");
              }}
            >
              <Check className="h-4 w-4" />
              Open notification center
            </button>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

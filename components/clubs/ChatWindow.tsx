"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useChat } from "@/hooks/useChat";
import { getChatMessages } from "@/lib/clubs";
import type { AuthUser, ChatMessage } from "@/lib/types";
import { useToast } from "@/components/ui/use-toast";
import {
  MessageCircle,
  PenLine,
  RefreshCw,
  Send,
  Trash2,
  Users,
} from "lucide-react";

const CHAT_PAGE_SIZE = 30;
const TYPING_IDLE_MS = 1200;

function mergeOlderMessages(
  olderMessages: ChatMessage[],
  currentMessages: ChatMessage[],
) {
  const currentIds = new Set(currentMessages.map((message) => message.id));
  return [
    ...olderMessages.filter((message) => !currentIds.has(message.id)),
    ...currentMessages,
  ];
}

export default function ChatWindow({
  clubId,
  roomId,
  currentUser,
}: {
  clubId: string;
  roomId: string;
  currentUser: AuthUser | null;
}) {
  const {
    messages,
    sendMessage,
    editMessage,
    deleteMessage,
    setMessages,
    startTyping,
    stopTyping,
    isSending,
    actionLoadingMessageId,
    chatError,
    currentUserId,
    participants,
    typingUsers,
    clearChatError,
  } = useChat(roomId, clubId, currentUser);

  const [text, setText] = useState("");
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [activeMessageId, setActiveMessageId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMoreHistory, setHasMoreHistory] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const listRef = useRef<HTMLDivElement | null>(null);
  const typingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const shouldScrollToBottomRef = useRef(true);
  const { toast } = useToast();

  const loadInitialHistory = useCallback(async () => {
    try {
      setIsLoadingHistory(true);
      shouldScrollToBottomRef.current = true;
      const history = await getChatMessages(clubId, roomId, CHAT_PAGE_SIZE);
      setMessages(history.messages);
      setNextCursor(history.pagination.nextCursor);
      setHasMoreHistory(history.pagination.hasMore);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to load chat history";
      toast({
        variant: "destructive",
        title: "Chat history unavailable",
        description: message,
      });
    } finally {
      setIsLoadingHistory(false);
    }
  }, [clubId, roomId, setMessages, toast]);

  useEffect(() => {
    void loadInitialHistory();
  }, [loadInitialHistory]);

  useEffect(() => {
    if (!shouldScrollToBottomRef.current) return;

    listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
    shouldScrollToBottomRef.current = true;
  }, [messages]);

  useEffect(() => {
    if (!chatError) return;

    toast({
      variant: "destructive",
      title: "Chat action failed",
      description: chatError,
    });
    clearChatError();
  }, [chatError, toast, clearChatError]);

  useEffect(() => {
    return () => {
      if (typingTimerRef.current) {
        clearTimeout(typingTimerRef.current);
      }
      stopTyping();
    };
  }, [stopTyping]);

  const loadOlderMessages = async () => {
    if (!nextCursor || isLoadingMore) return;

    const list = listRef.current;
    const previousScrollHeight = list?.scrollHeight ?? 0;

    try {
      setIsLoadingMore(true);
      shouldScrollToBottomRef.current = false;
      const history = await getChatMessages(
        clubId,
        roomId,
        CHAT_PAGE_SIZE,
        nextCursor,
      );

      setMessages((current) => mergeOlderMessages(history.messages, current));
      setNextCursor(history.pagination.nextCursor);
      setHasMoreHistory(history.pagination.hasMore);

      requestAnimationFrame(() => {
        if (!list) return;
        list.scrollTop = list.scrollHeight - previousScrollHeight;
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Unable to load older messages",
        description:
          error instanceof Error ? error.message : "Please try again.",
      });
    } finally {
      setIsLoadingMore(false);
    }
  };

  const startEditing = (id: string, currentContent: string) => {
    setEditingMessageId(id);
    setActiveMessageId(id);
    setEditText(currentContent);
  };

  const cancelEditing = () => {
    setEditingMessageId(null);
    setActiveMessageId(null);
    setEditText("");
  };

  const handleTextChange = (value: string) => {
    setText(value);

    if (value.trim()) {
      startTyping();
      if (typingTimerRef.current) {
        clearTimeout(typingTimerRef.current);
      }
      typingTimerRef.current = setTimeout(stopTyping, TYPING_IDLE_MS);
      return;
    }

    stopTyping();
  };

  const typingLabel =
    typingUsers.length === 0
      ? ""
      : typingUsers.length === 1
        ? `${typingUsers[0].username} is typing...`
        : `${typingUsers.length} readers are typing...`;

  return (
    <div className="app-surface-elevated flex h-[560px] min-w-0 flex-col overflow-hidden rounded-xl sm:h-[620px]">
      <div className="app-modal-header px-4 py-4">
        <div className="flex min-w-0 items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <span className="app-icon-frame h-9 w-9 shrink-0 rounded-lg">
              <MessageCircle className="h-4 w-4" />
            </span>
            <div className="min-w-0">
              <p className="font-serif text-xl leading-none">Club Chat</p>
              <p className="mt-1 text-[11px] uppercase tracking-[0.18em] text-[var(--app-accent-gold)]">
                General Room
              </p>
            </div>
          </div>

          <div className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-[var(--app-border-subtle)] px-3 py-1 text-xs text-[var(--app-text-secondary)]">
            <Users className="h-3.5 w-3.5 text-[var(--app-accent-gold)]" />
            {participants.length}
          </div>
        </div>
      </div>

      <div
        ref={listRef}
        className="flex-1 space-y-4 overflow-auto bg-[radial-gradient(circle_at_top,rgba(26,165,156,0.08),transparent_55%)] p-4"
      >
        {hasMoreHistory ? (
          <div className="text-center">
            <button
              type="button"
              onClick={() => void loadOlderMessages()}
              disabled={isLoadingMore}
              className="inline-flex items-center gap-2 rounded-lg border border-[var(--app-border-subtle)] px-3 py-1.5 text-xs text-[var(--app-accent-gold)] transition hover:bg-[rgba(216,181,109,0.08)] disabled:opacity-60"
            >
              <RefreshCw
                className={`h-3.5 w-3.5 ${isLoadingMore ? "animate-spin" : ""}`}
              />
              {isLoadingMore ? "Loading..." : "Load older messages"}
            </button>
          </div>
        ) : null}

        {isLoadingHistory ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="h-14 animate-pulse rounded-xl bg-[var(--app-surface)]"
              />
            ))}
          </div>
        ) : messages.length === 0 ? (
          <div className="flex h-full items-center justify-center rounded-xl border border-dashed border-[var(--app-border-subtle)] bg-[rgba(244,234,216,0.045)] px-4 text-center text-sm text-[var(--app-text-secondary)]">
            No messages yet. Start the first conversation.
          </div>
        ) : (
          messages.map((message) => {
            const isOwn = message.userId === currentUserId;
            const canUseActions =
              isOwn &&
              !message.isDeleted &&
              message.deliveryStatus !== "sending" &&
              message.deliveryStatus !== "failed";
            const messageTime = new Date(message.createdAt).toLocaleTimeString(
              [],
              {
                hour: "2-digit",
                minute: "2-digit",
              },
            );

            return (
              <div
                key={message.id}
                className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`min-w-0 w-full max-w-[88%] ${
                    isOwn ? "items-end" : "items-start"
                  }`}
                >
                  <div
                    className={`mb-1 flex min-w-0 flex-wrap items-center gap-2 text-xs ${
                      isOwn ? "justify-end" : "justify-start"
                    }`}
                  >
                    {!isOwn ? (
                      <span className="font-medium text-[var(--app-accent-gold)]">
                        {message.username}
                      </span>
                    ) : null}
                    <span className="text-[var(--app-text-muted)]">{messageTime}</span>
                    {message.deliveryStatus === "sending" ? (
                      <span className="text-[var(--app-accent-gold)]">Sending</span>
                    ) : null}
                    {message.deliveryStatus === "failed" ? (
                      <span className="text-red-300">Failed</span>
                    ) : null}
                  </div>

                  {canUseActions &&
                  activeMessageId === message.id &&
                  editingMessageId !== message.id ? (
                    <div className="mb-2 flex items-center justify-end gap-2 text-[11px]">
                      <button
                        type="button"
                        onClick={() => startEditing(message.id, message.content)}
                        className="inline-flex items-center gap-1 rounded-lg border border-[var(--app-border-subtle)] px-2 py-0.5 text-[var(--app-accent-gold)] hover:bg-[rgba(216,181,109,0.08)]"
                        disabled={actionLoadingMessageId === message.id}
                      >
                        <PenLine className="h-3 w-3" />
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={async () => {
                          const ok = await deleteMessage(message.id);
                          if (!ok) return;
                          setActiveMessageId(null);
                        }}
                        className="inline-flex items-center gap-1 rounded-full border border-red-300/35 px-2 py-0.5 text-red-300 hover:bg-red-400/10"
                        disabled={actionLoadingMessageId === message.id}
                      >
                        <Trash2 className="h-3 w-3" />
                        {actionLoadingMessageId === message.id
                          ? "Deleting..."
                          : "Delete"}
                      </button>
                    </div>
                  ) : null}

                  {editingMessageId === message.id ? (
                    <form
                      onSubmit={async (event) => {
                        event.preventDefault();
                        const ok = await editMessage(message.id, editText);
                        if (!ok) return;
                        cancelEditing();
                      }}
                      className="app-choice-row min-w-0 space-y-2 rounded-xl p-3"
                    >
                      <input
                        value={editText}
                        onChange={(event) => setEditText(event.target.value)}
                        className="app-input w-full px-2.5 py-1.5 text-sm"
                        autoFocus
                      />
                      <div className="flex justify-end gap-2">
                        <button
                          type="submit"
                          className="rounded-lg bg-[var(--app-accent-gold)] px-2.5 py-1 text-xs font-semibold text-[#171008]"
                          disabled={actionLoadingMessageId === message.id}
                        >
                          {actionLoadingMessageId === message.id
                            ? "Saving..."
                            : "Save"}
                        </button>
                        <button
                          type="button"
                          onClick={cancelEditing}
                          className="rounded-lg border border-[var(--app-border-subtle)] px-2.5 py-1 text-xs"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        if (!canUseActions) return;
                        setActiveMessageId((current) =>
                          current === message.id ? null : message.id,
                        );
                      }}
                      className={`w-full rounded-xl border p-3 text-left text-sm leading-relaxed transition ${
                        isOwn
                          ? "border-[var(--app-accent-gold)] bg-[var(--app-accent-teal-soft)] text-[var(--app-text-primary)] hover:border-[var(--app-border-strong)]"
                          : "border-[var(--app-border-subtle)] bg-[rgba(244,234,216,0.045)] text-[var(--app-text-primary)]"
                      } ${
                        canUseActions ? "cursor-pointer" : "cursor-default"
                      } ${activeMessageId === message.id ? "border-[var(--app-accent-gold)]" : ""} ${
                        message.deliveryStatus === "failed"
                          ? "border-red-300/45"
                          : ""
                      }`}
                    >
                      {message.isDeleted ? (
                        <span className="italic text-[var(--app-text-muted)]">
                          This message was deleted.
                        </span>
                      ) : (
                        message.content
                      )}
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="min-h-6 border-t border-[var(--app-border-subtle)] bg-[rgba(8,11,10,0.44)] px-4 py-1.5 text-xs text-[var(--app-accent-gold)]">
        {typingLabel}
      </div>

      <form
        onSubmit={async (event) => {
          event.preventDefault();
          if (!text.trim()) return;

          shouldScrollToBottomRef.current = true;
          stopTyping();
          const ok = await sendMessage(text.trim());
          if (!ok) return;
          setText("");
        }}
        className="border-t border-[var(--app-border-subtle)] bg-[rgba(8,11,10,0.44)] p-3"
      >
        <div className="flex min-w-0 flex-col gap-2 sm:flex-row">
          <input
            value={text}
            onChange={(event) => handleTextChange(event.target.value)}
            className="app-input w-full px-3 py-2"
            placeholder="Write a message..."
            disabled={isSending}
          />
          <button
            type="submit"
            className="app-button-primary w-full disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto"
            disabled={isSending || !text.trim()}
          >
            {!isSending ? <Send className="h-4 w-4" /> : null}
            {isSending ? "Sending..." : "Send"}
          </button>
        </div>
      </form>
    </div>
  );
}

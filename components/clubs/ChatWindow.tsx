"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useChat } from "@/hooks/useChat";
import { getChatMessages } from "@/lib/clubs";
import type { ChatMessage } from "@/lib/types";
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
}: {
  clubId: string;
  roomId: string;
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
  } = useChat(roomId, clubId);

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
    <div className="flex h-[620px] flex-col overflow-hidden rounded-xl border border-[#C9A96E]/25 bg-[#100904] shadow-[0_24px_60px_rgba(0,0,0,0.35)]">
      <div className="border-b border-[#C9A96E]/20 bg-[#2A1810]/90 px-4 py-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#C9A96E]/15 text-[#C9A96E]">
              <MessageCircle className="h-4 w-4" />
            </span>
            <div>
              <p className="font-serif text-xl leading-none">Club Chat</p>
              <p className="mt-1 text-[11px] uppercase tracking-[0.18em] text-[#C9A96E]">
                General Room
              </p>
            </div>
          </div>

          <div className="inline-flex items-center gap-1 rounded-full border border-[#C9A96E]/20 px-3 py-1 text-xs text-[#F2E8D9]/70">
            <Users className="h-3.5 w-3.5 text-[#C9A96E]" />
            {participants.length}
          </div>
        </div>
      </div>

      <div
        ref={listRef}
        className="flex-1 space-y-4 overflow-auto bg-[radial-gradient(circle_at_top,rgba(201,169,110,0.08),transparent_55%)] p-4"
      >
        {hasMoreHistory ? (
          <div className="text-center">
            <button
              type="button"
              onClick={() => void loadOlderMessages()}
              disabled={isLoadingMore}
              className="inline-flex items-center gap-2 rounded-full border border-[#C9A96E]/30 px-3 py-1.5 text-xs text-[#C9A96E] transition hover:bg-[#C9A96E]/10 disabled:opacity-60"
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
                className="h-14 animate-pulse rounded-xl bg-[#2A1810]/70"
              />
            ))}
          </div>
        ) : messages.length === 0 ? (
          <div className="flex h-full items-center justify-center rounded-xl border border-dashed border-[#C9A96E]/25 bg-[#1A0F07]/35 px-4 text-center text-sm text-[#F2E8D9]/65">
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
                  className={`w-full max-w-[88%] ${
                    isOwn ? "items-end" : "items-start"
                  }`}
                >
                  <div
                    className={`mb-1 flex items-center gap-2 text-xs ${
                      isOwn ? "justify-end" : "justify-start"
                    }`}
                  >
                    {!isOwn ? (
                      <span className="font-medium text-[#C9A96E]">
                        {message.username}
                      </span>
                    ) : null}
                    <span className="text-[#F2E8D9]/45">{messageTime}</span>
                    {message.deliveryStatus === "sending" ? (
                      <span className="text-[#C9A96E]/70">Sending</span>
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
                        className="inline-flex items-center gap-1 rounded-full border border-[#C9A96E]/40 px-2 py-0.5 text-[#C9A96E] hover:bg-[#C9A96E]/15"
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
                      className="space-y-2 rounded-xl border border-[#C9A96E]/30 bg-[#1A0F07] p-3"
                    >
                      <input
                        value={editText}
                        onChange={(event) => setEditText(event.target.value)}
                        className="w-full rounded-lg border border-[#C9A96E]/30 bg-[#2A1810] px-2.5 py-1.5 text-sm text-[#F2E8D9]"
                        autoFocus
                      />
                      <div className="flex justify-end gap-2">
                        <button
                          type="submit"
                          className="rounded-lg bg-[#C9A96E] px-2.5 py-1 text-xs font-semibold text-[#1A0F07]"
                          disabled={actionLoadingMessageId === message.id}
                        >
                          {actionLoadingMessageId === message.id
                            ? "Saving..."
                            : "Save"}
                        </button>
                        <button
                          type="button"
                          onClick={cancelEditing}
                          className="rounded-lg border border-[#C9A96E]/40 px-2.5 py-1 text-xs"
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
                          ? "border-[#C9A96E]/35 bg-[#C9A96E]/18 text-[#F2E8D9] hover:border-[#C9A96E]/65"
                          : "border-[#C9A96E]/15 bg-[#1A0F07]/75 text-[#F2E8D9]/92"
                      } ${
                        canUseActions ? "cursor-pointer" : "cursor-default"
                      } ${activeMessageId === message.id ? "border-[#C9A96E]/70" : ""} ${
                        message.deliveryStatus === "failed"
                          ? "border-red-300/45"
                          : ""
                      }`}
                    >
                      {message.isDeleted ? (
                        <span className="italic text-[#F2E8D9]/45">
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

      <div className="min-h-6 border-t border-[#C9A96E]/10 bg-[#1A0F07]/70 px-4 py-1.5 text-xs text-[#C9A96E]/80">
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
        className="border-t border-[#C9A96E]/20 bg-[#1A0F07]/70 p-3"
      >
        <div className="flex gap-2">
          <input
            value={text}
            onChange={(event) => handleTextChange(event.target.value)}
            className="w-full rounded-lg border border-[#C9A96E]/30 bg-[#2A1810] px-3 py-2 text-[#F2E8D9] placeholder:text-[#F2E8D9]/45 focus:border-[#C9A96E]/55 focus:outline-none"
            placeholder="Write a message..."
            disabled={isSending}
          />
          <button
            type="submit"
            className="inline-flex items-center gap-2 rounded-lg bg-[#C9A96E] px-4 py-2 text-sm font-semibold text-[#1A0F07] shadow-[0_8px_20px_rgba(201,169,110,0.35)] transition hover:bg-[#d8b884] disabled:cursor-not-allowed disabled:opacity-70"
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

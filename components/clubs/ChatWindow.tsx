"use client";
import { useEffect, useRef, useState } from "react";
import { useChat } from "@/hooks/useChat";
import { getChatMessages } from "@/lib/clubs";
import { useToast } from "@/components/ui/use-toast";
import { MessageCircle, PenLine, Send, Trash2 } from "lucide-react";

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
    isSending,
    actionLoadingMessageId,
    chatError,
    currentUserId,
    clearChatError,
  } = useChat(roomId, clubId);
  const [text, setText] = useState("");
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [activeMessageId, setActiveMessageId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const listRef = useRef<HTMLDivElement | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // fetch history
    void (async () => {
      try {
        const history = await getChatMessages(clubId, roomId, 100);
        setMessages(history);
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Failed to load chat history";
        toast({
          variant: "destructive",
          title: "Chat history unavailable",
          description: message,
        });
      }
    })();
  }, [clubId, roomId, setMessages]);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
  }, [messages]);

  useEffect(() => {
    if (chatError) {
      toast({
        variant: "destructive",
        title: "Chat action failed",
        description: chatError,
      });
      clearChatError();
    }
  }, [chatError, toast, clearChatError]);

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

  return (
    <div className="flex h-[620px] flex-col overflow-hidden rounded-xl border border-[#C9A96E]/25 bg-[#100904] shadow-[0_24px_60px_rgba(0,0,0,0.35)]">
      <div className="border-b border-[#C9A96E]/20 bg-[#2A1810]/90 px-4 py-4">
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
      </div>

      <div
        ref={listRef}
        className="flex-1 space-y-4 overflow-auto bg-[radial-gradient(circle_at_top,rgba(201,169,110,0.08),transparent_55%)] p-4"
      >
        {messages.length === 0 ? (
          <div className="flex h-full items-center justify-center rounded-xl border border-dashed border-[#C9A96E]/25 bg-[#1A0F07]/35 px-4 text-center text-sm text-[#F2E8D9]/65">
            No messages yet. Start the first conversation.
          </div>
        ) : (
          messages.map((m) => {
            const isOwn = m.userId === currentUserId;
            const messageTime = new Date(m.createdAt).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            });

            return (
              <div
                key={m.id}
                className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
              >
                <div className={`w-full max-w-[88%] ${isOwn ? "items-end" : "items-start"}`}>
                  <div className={`mb-1 flex items-center gap-2 text-xs ${isOwn ? "justify-end" : "justify-start"}`}>
                    {!isOwn && <span className="font-medium text-[#C9A96E]">{m.username}</span>}
                    <span className="text-[#F2E8D9]/45">{messageTime}</span>
                  </div>

                  {isOwn && activeMessageId === m.id && editingMessageId !== m.id && (
                    <div className="mb-2 flex items-center justify-end gap-2 text-[11px]">
                      <button
                        type="button"
                        onClick={() => startEditing(m.id, m.content)}
                        className="inline-flex items-center gap-1 rounded-full border border-[#C9A96E]/40 px-2 py-0.5 text-[#C9A96E] hover:bg-[#C9A96E]/15"
                        disabled={actionLoadingMessageId === m.id}
                      >
                        <PenLine className="h-3 w-3" />
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={async () => {
                          const ok = await deleteMessage(m.id);
                          if (!ok) return;
                          setActiveMessageId(null);
                        }}
                        className="inline-flex items-center gap-1 rounded-full border border-red-300/35 px-2 py-0.5 text-red-300 hover:bg-red-400/10"
                        disabled={actionLoadingMessageId === m.id}
                      >
                        <Trash2 className="h-3 w-3" />
                        {actionLoadingMessageId === m.id ? "Deleting..." : "Delete"}
                      </button>
                    </div>
                  )}

                  {editingMessageId === m.id ? (
                    <form
                      onSubmit={async (e) => {
                        e.preventDefault();
                        const ok = await editMessage(m.id, editText);
                        if (!ok) return;
                        cancelEditing();
                      }}
                      className="space-y-2 rounded-xl border border-[#C9A96E]/30 bg-[#1A0F07] p-3"
                    >
                      <input
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        className="w-full rounded-lg border border-[#C9A96E]/30 bg-[#2A1810] px-2.5 py-1.5 text-sm text-[#F2E8D9]"
                        autoFocus
                      />
                      <div className="flex justify-end gap-2">
                        <button
                          type="submit"
                          className="rounded-lg bg-[#C9A96E] px-2.5 py-1 text-xs font-semibold text-[#1A0F07]"
                          disabled={actionLoadingMessageId === m.id}
                        >
                          {actionLoadingMessageId === m.id ? "Saving..." : "Save"}
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
                        if (!isOwn) return;
                        setActiveMessageId((current) => (current === m.id ? null : m.id));
                      }}
                      className={`w-full rounded-xl border p-3 text-left text-sm leading-relaxed transition ${
                        isOwn
                          ? "cursor-pointer border-[#C9A96E]/35 bg-[#C9A96E]/18 text-[#F2E8D9] hover:border-[#C9A96E]/65"
                          : "cursor-default border-[#C9A96E]/15 bg-[#1A0F07]/75 text-[#F2E8D9]/92"
                      } ${activeMessageId === m.id ? "border-[#C9A96E]/70" : ""}`}
                    >
                      {m.content}
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      <form
        onSubmit={async (e) => {
          e.preventDefault();
          if (text.trim()) {
            const ok = await sendMessage(text.trim());
            if (!ok) return;
            setText("");
          }
        }}
        className="border-t border-[#C9A96E]/20 bg-[#1A0F07]/70 p-3"
      >
        <div className="flex gap-2">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
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

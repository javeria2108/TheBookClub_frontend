"use client";
import { useEffect, useRef, useState } from "react";
import { useChat } from "@/hooks/useChat";
import { getChatMessages } from "@/lib/clubs";
import { useToast } from "@/components/ui/use-toast";

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
    <div className="flex h-105 flex-col rounded-xl border border-[#C9A96E]/20 bg-[#2A1810]/70">
      <div ref={listRef} className="flex-1 overflow-auto p-4">
        {messages.map((m) => (
          <div key={m.id} className="mb-2">
            <div className="mb-1 flex items-center justify-between">
              <div className="text-xs text-gray-400">{m.username}</div>
              {m.userId === currentUserId && activeMessageId === m.id && editingMessageId !== m.id && (
                <div className="flex items-center gap-2 text-[11px]">
                  <button
                    type="button"
                    onClick={() => startEditing(m.id, m.content)}
                    className="text-[#C9A96E] hover:text-[#d8b884]"
                    disabled={actionLoadingMessageId === m.id}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      const ok = await deleteMessage(m.id);
                      if (!ok) return;
                      setActiveMessageId(null);
                    }}
                    className="text-red-300 hover:text-red-200"
                    disabled={actionLoadingMessageId === m.id}
                  >
                    {actionLoadingMessageId === m.id ? "Deleting..." : "Delete"}
                  </button>
                </div>
              )}
            </div>

            {editingMessageId === m.id ? (
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  const ok = await editMessage(m.id, editText);
                  if (!ok) return;
                  cancelEditing();
                }}
                className="space-y-2 rounded bg-[#2A1810] p-2"
              >
                <input
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  className="w-full rounded border border-[#C9A96E]/30 bg-[#1A0F07] px-2 py-1 text-sm text-[#F2E8D9]"
                  autoFocus
                />
                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="rounded bg-[#C9A96E] px-2 py-1 text-xs font-semibold text-[#1A0F07]"
                    disabled={actionLoadingMessageId === m.id}
                  >
                    {actionLoadingMessageId === m.id ? "Saving..." : "Save"}
                  </button>
                  <button
                    type="button"
                    onClick={cancelEditing}
                    className="rounded border border-[#C9A96E]/40 px-2 py-1 text-xs"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <button
                type="button"
                onClick={() => {
                  if (m.userId !== currentUserId) return;
                  setActiveMessageId((current) =>
                    current === m.id ? null : m.id,
                  );
                }}
                className={`w-full rounded bg-[#2A1810] p-2 text-left ${
                  m.userId === currentUserId ? "cursor-pointer border border-transparent hover:border-[#C9A96E]/30" : "cursor-default"
                } ${activeMessageId === m.id ? "border-[#C9A96E]/40" : ""}`}
              >
                {m.content}
              </button>
            )}
          </div>
        ))}
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
        className="border-t border-[#C9A96E]/20 p-3"
      >
        <div className="flex gap-2">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="w-full rounded border border-[#C9A96E]/30 bg-[#1A0F07] px-3 py-2 text-[#F2E8D9] placeholder:text-[#F2E8D9]/50"
            placeholder="Write a message..."
            disabled={isSending}
          />
          <button
            type="submit"
            className="rounded bg-[#C9A96E] px-4 py-2 text-sm font-semibold text-[#1A0F07] disabled:cursor-not-allowed disabled:opacity-70"
            disabled={isSending || !text.trim()}
          >
            {isSending ? "Sending..." : "Send"}
          </button>
        </div>
      </form>
    </div>
  );
}

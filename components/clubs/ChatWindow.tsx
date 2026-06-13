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
  const { messages, sendMessage, setMessages } = useChat(roomId, clubId);
  const [text, setText] = useState("");
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

  return (
    <div className="flex h-105 flex-col rounded-xl border border-[#C9A96E]/20 bg-[#2A1810]/70">
      <div ref={listRef} className="flex-1 overflow-auto p-4">
        {messages.map((m) => (
          <div key={m.id} className="mb-2">
            <div className="text-xs text-gray-400">{m.username}</div>
            <div className="rounded bg-[#2A1810] p-2">{m.content}</div>
          </div>
        ))}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (text.trim()) {
            sendMessage(text.trim());
            setText("");
          }
        }}
        className="border-t border-[#C9A96E]/20 p-3"
      >
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="w-full rounded border border-[#C9A96E]/30 bg-[#1A0F07] px-3 py-2 text-[#F2E8D9] placeholder:text-[#F2E8D9]/50"
          placeholder="Write a message..."
        />
      </form>
    </div>
  );
}

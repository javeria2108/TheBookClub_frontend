"use client";
import { useEffect, useRef, useState } from "react";
import { useChat } from "@/hooks/useChat";
import { getClubById } from "@/lib/clubs"; // optional for room list

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

  useEffect(() => {
    // fetch history
    (async () => {
      const res = await fetch(
        `/api/clubs/${clubId}/chat/messages?roomId=${roomId}`,
      );
      const body = await res.json();
      if (res.ok) setMessages(body.data.messages);
    })();
  }, [clubId, roomId, setMessages]);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
  }, [messages]);

  return (
    <div className="flex h-full flex-col">
      <div ref={listRef} className="overflow-auto p-4">
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
        className="p-3"
      >
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="w-full rounded px-3 py-2"
          placeholder="Write a message..."
        />
      </form>
    </div>
  );
}

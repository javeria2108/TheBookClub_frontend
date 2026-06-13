import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import type { ChatMessage } from "@/lib/types";

export function useChat(roomId: string, clubId: string) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const socket = io("http://localhost:5001", { withCredentials: true });
    socketRef.current = socket;

    socket.on("connect", () => {
      socket.emit("joinRoom", { roomId });
    });

    socket.on("message", (msg: ChatMessage) => {
      setMessages((s) => [...s, msg]);
    });

    return () => {
      socket.emit("leaveRoom", { roomId });
      socket.disconnect();
    };
  }, [roomId]);

  const sendMessage = (content: string) => {
    if (!socketRef.current) return;
    const trimmed = content.trim();
    if (!trimmed) return;

    // Let the server broadcast be the single source of truth.
    // This avoids sender-side duplicates from optimistic + echoed message.
    socketRef.current.emit("message", { roomId, clubId, content: trimmed });
  };

  return { messages, sendMessage, setMessages };
}

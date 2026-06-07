import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import { getStoredToken } from "@/lib/auth";
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

    socket.on("message", (msg) => {
      setMessages((s) => [...s, msg]);
    });

    return () => {
      socket.emit("leaveRoom", { roomId });
      socket.disconnect();
    };
  }, [roomId]);

  const sendMessage = (content: string) => {
    if (!socketRef.current) return;
    socketRef.current.emit("message", { roomId, clubId, content });
    // optimistic add (optional)
    setMessages((s) => [
      ...s,
      {
        id: `temp-${Date.now()}`,
        roomId,
        clubId,
        userId: "me",
        username: "You",
        content,
        createdAt: new Date().toISOString(),
      },
    ]);
  };

  return { messages, sendMessage, setMessages };
}

import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import type { ChatMessage } from "@/lib/types";
import { getStoredToken } from "@/lib/auth";

type SocketAck = {
  ok: boolean;
  message?: string;
};

function getCurrentUserId(): string | null {
  const token = getStoredToken();
  if (!token) return null;

  const parts = token.split(".");
  if (parts.length !== 3) return null;

  try {
    const payloadJson = atob(parts[1].replace(/-/g, "+").replace(/_/g, "/"));
    const payload = JSON.parse(payloadJson) as { id?: string };
    return typeof payload.id === "string" ? payload.id : null;
  } catch {
    return null;
  }
}

export function useChat(roomId: string, clubId: string) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [actionLoadingMessageId, setActionLoadingMessageId] = useState<
    string | null
  >(null);
  const [chatError, setChatError] = useState<string | null>(null);
  const [currentUserId] = useState<string | null>(() => getCurrentUserId());
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const socket = io("http://localhost:5001", { withCredentials: true });
    socketRef.current = socket;

    socket.on("connect", () => {
      socket.emit("joinRoom", { roomId });
    });

    socket.on("message", (msg: ChatMessage) => {
      setMessages((s) => {
        if (s.some((existing) => existing.id === msg.id)) {
          return s;
        }

        return [...s, msg];
      });
    });

    socket.on(
      "messageEdited",
      (payload: { id: string; content: string; createdAt: string }) => {
        setMessages((s) =>
          s.map((m) =>
            m.id === payload.id
              ? {
                  ...m,
                  content: payload.content,
                  createdAt: payload.createdAt,
                }
              : m,
          ),
        );
      },
    );

    socket.on("messageDeleted", ({ id }: { id: string }) => {
      setMessages((s) => s.filter((m) => m.id !== id));
    });

    socket.on("chatError", ({ message }: { message?: string }) => {
      if (message) {
        setChatError(message);
      }
    });

    return () => {
      socket.emit("leaveRoom", { roomId });
      socket.disconnect();
    };
  }, [roomId]);

  const sendMessage = async (content: string): Promise<boolean> => {
    if (!socketRef.current) return false;
    const trimmed = content.trim();
    if (!trimmed) return false;

    setIsSending(true);
    setChatError(null);

    const result = await new Promise<boolean>((resolve) => {
      socketRef.current?.emit(
        "message",
        { roomId, clubId, content: trimmed },
        (ack: SocketAck) => {
          if (!ack?.ok) {
            setChatError(ack?.message ?? "Failed to send message");
            resolve(false);
            return;
          }

          resolve(true);
        },
      );
    });

    setIsSending(false);
    return result;
  };

  const editMessage = async (
    messageId: string,
    content: string,
  ): Promise<boolean> => {
    if (!socketRef.current) return false;
    if (!messageId.trim()) return false;

    const trimmed = content.trim();
    if (!trimmed) return false;

    setActionLoadingMessageId(messageId);
    setChatError(null);

    const result = await new Promise<boolean>((resolve) => {
      socketRef.current?.emit(
        "editMessage",
        { messageId, clubId, content: trimmed },
        (ack: SocketAck) => {
          if (!ack?.ok) {
            setChatError(ack?.message ?? "Failed to edit message");
            resolve(false);
            return;
          }
          resolve(true);
        },
      );
    });

    setActionLoadingMessageId(null);
    return result;
  };

  const deleteMessage = async (messageId: string): Promise<boolean> => {
    if (!socketRef.current) return false;
    if (!messageId.trim()) return false;

    setActionLoadingMessageId(messageId);
    setChatError(null);

    const result = await new Promise<boolean>((resolve) => {
      socketRef.current?.emit(
        "deleteMessage",
        { messageId, clubId },
        (ack: SocketAck) => {
          if (!ack?.ok) {
            setChatError(ack?.message ?? "Failed to delete message");
            resolve(false);
            return;
          }
          resolve(true);
        },
      );
    });

    setActionLoadingMessageId(null);
    return result;
  };

  return {
    messages,
    setMessages,
    sendMessage,
    editMessage,
    deleteMessage,
    isSending,
    actionLoadingMessageId,
    chatError,
    currentUserId,
    clearChatError: () => setChatError(null),
  };
}

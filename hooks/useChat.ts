import { useCallback, useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import type { ChatMessage } from "@/lib/types";
import { getCurrentUser } from "@/lib/auth";
import type { AuthUser } from "@/lib/types";

const SOCKET_URL =
  process.env.NEXT_PUBLIC_SOCKET_URL ?? "http://localhost:5001";

type SocketAck<T = undefined> = {
  ok: boolean;
  message?: string;
  data?: T;
};

export type ChatParticipant = {
  socketId: string;
  userId: string;
  username: string;
};

export type TypingUser = {
  socketId: string;
  userId: string;
  username: string;
};

function createClientMessageId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `client-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function getDisplayName(user: AuthUser | null): string {
  return user?.username.trim() || "You";
}

function mergeMessage(messages: ChatMessage[], incoming: ChatMessage) {
  const clientMessageId = incoming.clientMessageId;

  if (clientMessageId) {
    const optimisticIndex = messages.findIndex(
      (message) => message.clientMessageId === clientMessageId,
    );

    if (optimisticIndex >= 0) {
      return messages.map((message, index) =>
        index === optimisticIndex
          ? { ...incoming, deliveryStatus: "sent" as const }
          : message,
      );
    }
  }

  if (messages.some((message) => message.id === incoming.id)) {
    return messages.map((message) =>
      message.id === incoming.id
        ? { ...message, ...incoming, deliveryStatus: "sent" as const }
        : message,
    );
  }

  return [...messages, { ...incoming, deliveryStatus: "sent" as const }];
}

export function useChat(roomId: string, clubId: string) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [actionLoadingMessageId, setActionLoadingMessageId] = useState<
    string | null
  >(null);
  const [chatError, setChatError] = useState<string | null>(null);
  const [participants, setParticipants] = useState<ChatParticipant[]>([]);
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const currentUserId = currentUser?.id ?? null;
  const socketRef = useRef<Socket | null>(null);
  const isTypingRef = useRef(false);

  useEffect(() => {
    let isMounted = true;
    let socket: Socket | null = null;

    async function connectChat() {
      try {
        const user = await getCurrentUser();

        if (!isMounted) return;

        setCurrentUser(user);

        socket = io(SOCKET_URL, { withCredentials: true });
        socketRef.current = socket;

        socket.on("connect", () => {
          socket?.emit("joinRoom", { roomId, clubId }, (ack: SocketAck) => {
            if (!ack?.ok) {
              setChatError(ack?.message ?? "Failed to join chat room");
            }
          });
        });

        socket.on("message", (message: ChatMessage) => {
          setMessages((current) => mergeMessage(current, message));
        });

        socket.on("messageEdited", (message: ChatMessage) => {
          setMessages((current) =>
            current.map((existing) =>
              existing.id === message.id
                ? { ...existing, ...message, deliveryStatus: "sent" }
                : existing,
            ),
          );
        });

        socket.on("messageDeleted", (message: ChatMessage) => {
          setMessages((current) =>
            current.map((existing) =>
              existing.id === message.id
                ? { ...existing, ...message, deliveryStatus: "sent" }
                : existing,
            ),
          );
        });

        socket.on(
          "chatPresence",
          ({
            participants: nextParticipants,
          }: {
            participants: ChatParticipant[];
          }) => {
            setParticipants(nextParticipants);
          },
        );

        socket.on("userTyping", (typingUser: TypingUser) => {
          if (typingUser.userId === user.id) return;

          setTypingUsers((current) => {
            if (
              current.some(
                (existingUser) => existingUser.socketId === typingUser.socketId,
              )
            ) {
              return current;
            }

            return [...current, typingUser];
          });
        });

        socket.on(
          "userStoppedTyping",
          ({ socketId }: { socketId: string; userId?: string }) => {
            setTypingUsers((current) =>
              current.filter((typingUser) => typingUser.socketId !== socketId),
            );
          },
        );

        socket.on("chatError", ({ message }: { message?: string }) => {
          if (message) {
            setChatError(message);
          }
        });
      } catch {
        if (isMounted) {
          setChatError("You must be logged in to use chat.");
        }
      }
    }

    void connectChat();

    return () => {
      isMounted = false;
      socket?.emit("typingStopped", { roomId, clubId });
      socket?.emit("leaveRoom", { roomId });
      socket?.disconnect();
      socketRef.current = null;
      setParticipants([]);
      setTypingUsers([]);
      isTypingRef.current = false;
    };
  }, [clubId, roomId]);

  const sendMessage = useCallback(
    async (content: string): Promise<boolean> => {
      if (!socketRef.current) return false;

      const trimmed = content.trim();
      if (!trimmed || !currentUserId) return false;

      const clientMessageId = createClientMessageId();
      const optimisticMessage: ChatMessage = {
        id: clientMessageId,
        clientMessageId,
        roomId,
        clubId,
        userId: currentUserId,
        username: getDisplayName(currentUser),
        content: trimmed,
        createdAt: new Date().toISOString(),
        isDeleted: false,
        deletedAt: null,
        deliveryStatus: "sending",
      };

      setIsSending(true);
      setChatError(null);
      setMessages((current) => [...current, optimisticMessage]);

      const result = await new Promise<boolean>((resolve) => {
        socketRef.current?.emit(
          "message",
          { roomId, clubId, content: trimmed, clientMessageId },
          (ack: SocketAck<ChatMessage>) => {
            if (!ack?.ok) {
              setChatError(ack?.message ?? "Failed to send message");
              setMessages((current) =>
                current.map((message) =>
                  message.clientMessageId === clientMessageId
                    ? { ...message, deliveryStatus: "failed" }
                    : message,
                ),
              );
              resolve(false);
              return;
            }

            if (ack.data) {
              setMessages((current) => mergeMessage(current, ack.data!));
            }

            resolve(true);
          },
        );
      });

      setIsSending(false);
      return result;
    },
    [clubId, currentUser, currentUserId, roomId],
  );

  const editMessage = useCallback(
    async (messageId: string, content: string): Promise<boolean> => {
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
          (ack: SocketAck<ChatMessage>) => {
            if (!ack?.ok) {
              setChatError(ack?.message ?? "Failed to edit message");
              resolve(false);
              return;
            }

            if (ack.data) {
              setMessages((current) =>
                current.map((message) =>
                  message.id === ack.data!.id
                    ? { ...message, ...ack.data!, deliveryStatus: "sent" }
                    : message,
                ),
              );
            }

            resolve(true);
          },
        );
      });

      setActionLoadingMessageId(null);
      return result;
    },
    [clubId],
  );

  const deleteMessage = useCallback(
    async (messageId: string): Promise<boolean> => {
      if (!socketRef.current) return false;
      if (!messageId.trim()) return false;

      setActionLoadingMessageId(messageId);
      setChatError(null);

      const result = await new Promise<boolean>((resolve) => {
        socketRef.current?.emit(
          "deleteMessage",
          { messageId, clubId },
          (ack: SocketAck<ChatMessage>) => {
            if (!ack?.ok) {
              setChatError(ack?.message ?? "Failed to delete message");
              resolve(false);
              return;
            }

            if (ack.data) {
              setMessages((current) =>
                current.map((message) =>
                  message.id === ack.data!.id
                    ? { ...message, ...ack.data!, deliveryStatus: "sent" }
                    : message,
                ),
              );
            }

            resolve(true);
          },
        );
      });

      setActionLoadingMessageId(null);
      return result;
    },
    [clubId],
  );

  const startTyping = useCallback(() => {
    if (isTypingRef.current) return;

    isTypingRef.current = true;
    socketRef.current?.emit("typingStarted", { roomId, clubId });
  }, [clubId, roomId]);

  const stopTyping = useCallback(() => {
    if (!isTypingRef.current) return;

    isTypingRef.current = false;
    socketRef.current?.emit("typingStopped", { roomId, clubId });
  }, [clubId, roomId]);

  const clearChatError = useCallback(() => {
    setChatError(null);
  }, []);

  return {
    messages,
    setMessages,
    sendMessage,
    editMessage,
    deleteMessage,
    startTyping,
    stopTyping,
    isSending,
    actionLoadingMessageId,
    chatError,
    currentUserId,
    participants,
    typingUsers,
    clearChatError,
  };
}

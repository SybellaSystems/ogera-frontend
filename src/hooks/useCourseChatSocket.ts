import { useEffect, useRef, useCallback, useState } from "react";
import { io, Socket } from "socket.io-client";
import { getSocketUrl } from "../utils/socketUrl";
import type { CourseChatMessage } from "../services/api/coursesApi";

interface UseCourseChatSocketOptions {
  courseId: string | null;
  accessToken: string | null;
  /** For support: which student's thread to join (receives real-time for that thread). */
  conversationUserId?: string | null;
  onMessage?: (msg: CourseChatMessage) => void;
  onJoinError?: (message: string) => void;
}

const CONNECTION_TIMEOUT_MS = 10000;

export function useCourseChatSocket({
  courseId,
  accessToken,
  conversationUserId,
  onMessage,
  onJoinError,
}: UseCourseChatSocketOptions) {
  const socketRef = useRef<Socket | null>(null);
  const onMessageRef = useRef(onMessage);
  const onJoinErrorRef = useRef(onJoinError);
  const [connected, setConnected] = useState(false);
  const [joinOk, setJoinOk] = useState<boolean | null>(null);
  const [connectionFailed, setConnectionFailed] = useState(false);

  onMessageRef.current = onMessage;
  onJoinErrorRef.current = onJoinError;

  const sendMessage = useCallback(
    (
      content: string,
      callback?: (ok: boolean, err?: string) => void,
      replyToUserId?: string | null
    ) => {
      if (!socketRef.current || !courseId) {
        callback?.(false, "Not connected");
        return;
      }
      const payload: { courseId: string; content: string; replyToUserId?: string } = {
        courseId,
        content,
      };
      if (replyToUserId) payload.replyToUserId = replyToUserId;
      socketRef.current.emit(
        "course:message",
        payload,
        (res: { ok: boolean; message?: string } | CourseChatMessage) => {
          if (res && typeof (res as { ok?: boolean }).ok === "boolean") {
            const r = res as { ok: boolean; message?: string };
            callback?.(r.ok, r.message);
          } else {
            callback?.(true);
          }
        }
      );
    },
    [courseId]
  );

  useEffect(() => {
    if (!courseId || !accessToken) {
      return;
    }
    setConnectionFailed(false);
    const url = getSocketUrl();
    const socket = io(url, {
      auth: { token: accessToken },
      path: "/socket.io",
      transports: ["websocket", "polling"],
    });
    socketRef.current = socket;

    const timeoutId = window.setTimeout(() => {
      if (!socket.connected) {
        setConnectionFailed(true);
        setJoinOk(false);
      }
    }, CONNECTION_TIMEOUT_MS);

    socket.on("connect", () => {
      setConnectionFailed(false);
      setConnected(true);
      setJoinOk(null);
      const joinPayload: { courseId: string; conversationUserId?: string } = {
        courseId,
      };
      if (conversationUserId) joinPayload.conversationUserId = conversationUserId;
      socket.emit("course:join", joinPayload, (res: { ok: boolean; message?: string }) => {
        if (res?.ok) {
          setJoinOk(true);
        } else {
          setJoinOk(false);
          onJoinErrorRef.current?.(res?.message || "Failed to join chat");
        }
      });
    });

    socket.on("course:message", (msg: CourseChatMessage) => {
      onMessageRef.current?.(msg);
    });

    socket.on("disconnect", () => {
      setConnected(false);
      setJoinOk(null);
    });

    socket.on("connect_error", () => {
      setConnected(false);
      setJoinOk(false);
      setConnectionFailed(true);
    });

    return () => {
      window.clearTimeout(timeoutId);
      socket.removeAllListeners();
      socket.disconnect();
      socketRef.current = null;
      setConnected(false);
      setJoinOk(null);
      setConnectionFailed(false);
    };
  }, [courseId, accessToken, conversationUserId]);

  return { connected, joinOk, connectionFailed, sendMessage };
}

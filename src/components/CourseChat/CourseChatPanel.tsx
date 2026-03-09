import React, { useEffect, useRef, useState } from "react";
import {
  XMarkIcon,
  PaperAirplaneIcon,
  ChatBubbleLeftRightIcon,
} from "@heroicons/react/24/outline";
import { useGetCourseChatHistoryQuery } from "../../services/api/coursesApi";
import { useCourseChatSocket } from "../../hooks/useCourseChatSocket";
import type { CourseChatMessage } from "../../services/api/coursesApi";
import { formatRelativeTime } from "../../utils/timeUtils";

const SUPPORT_ROLES = ["superadmin", "admin", "courseadmin", "employer"];
function isSupportRole(role: string | undefined): boolean {
  return SUPPORT_ROLES.some((r) => role?.toLowerCase() === r.toLowerCase());
}

interface CourseChatPanelProps {
  courseId: string;
  courseName: string;
  accessToken: string | null;
  currentUserId: string | null;
  currentUserRole?: string;
  onClose: () => void;
}

export const CourseChatPanel: React.FC<CourseChatPanelProps> = ({
  courseId,
  courseName,
  accessToken,
  currentUserId,
  currentUserRole,
  onClose,
}) => {
  const [messages, setMessages] = useState<CourseChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [sendError, setSendError] = useState<string | null>(null);
  const [selectedConversationUserId, setSelectedConversationUserId] = useState<
    string | null
  >(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const isSupport = isSupportRole(currentUserRole);

  const { data: historyData } = useGetCourseChatHistoryQuery(courseId, {
    skip: !courseId,
    refetchOnMountOrArgChange: false,
    refetchOnFocus: false,
  });

  const { connected, joinOk, connectionFailed, sendMessage } = useCourseChatSocket({
    courseId,
    accessToken,
    conversationUserId: isSupport ? selectedConversationUserId : undefined,
    onMessage: (msg) => {
      setMessages((prev) => {
        if (prev.some((m) => m.message_id === msg.message_id)) return prev;
        return [...prev, msg];
      });
    },
    onJoinError: (msg) => setSendError(msg),
  });

  const chatParticipants = React.useMemo(() => {
    const raw = historyData?.data;
    if (!raw) return { messages: [], participants: [] as { user_id: string; full_name: string }[] };
    if (Array.isArray(raw)) return { messages: raw, participants: [] };
    return {
      messages: (raw as { messages: CourseChatMessage[] }).messages ?? [],
      participants: (raw as { participants?: { user_id: string; full_name: string }[] }).participants ?? [],
    };
  }, [historyData?.data]);

  useEffect(() => {
    if (chatParticipants.messages.length > 0) {
      setMessages(chatParticipants.messages);
    }
  }, [chatParticipants.messages]);

  const conversationUserIds = React.useMemo(() => {
    const ids = new Set<string>();
    messages.forEach((m) => {
      const cid =
        m.conversation_user_id ??
        (m.role?.toLowerCase() === "student" ? m.user_id : null);
      if (cid) ids.add(cid);
    });
    return Array.from(ids);
  }, [messages]);

  const participantNameByUserId = React.useMemo(() => {
    const map: Record<string, string> = {};
    chatParticipants.participants.forEach((p) => {
      map[p.user_id] = p.full_name?.trim() || `Student ${p.user_id.slice(0, 8)}…`;
    });
    return map;
  }, [chatParticipants.participants]);

  useEffect(() => {
    if (isSupport && conversationUserIds.length > 0 && !selectedConversationUserId) {
      setSelectedConversationUserId(conversationUserIds[0]);
    }
  }, [isSupport, conversationUserIds, selectedConversationUserId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    const text = input.trim();
    if (!text) return;
    if (isSupport && !selectedConversationUserId) {
      setSendError("Select a student conversation to reply to.");
      return;
    }
    setSendError(null);
    const replyTo = isSupport ? selectedConversationUserId ?? undefined : undefined;
    sendMessage(text, (ok, err) => {
      if (ok) {
        setInput("");
      } else {
        setSendError(err || "Failed to send");
      }
    }, replyTo);
  };

  const canSend =
    connected &&
    joinOk === true &&
    input.trim().length > 0 &&
    (!isSupport || !!selectedConversationUserId);

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-white shadow-xl border-l border-gray-200 flex flex-col animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center gap-2">
          <ChatBubbleLeftRightIcon className="h-6 w-6 text-purple-600" />
          <div>
            <h3 className="font-semibold text-gray-900">Course Support</h3>
            <p className="text-xs text-gray-500 truncate max-w-[200px]">
              {courseName}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="p-2 rounded-lg text-gray-500 hover:bg-gray-200 hover:text-gray-700 transition"
          aria-label="Close chat"
        >
          <XMarkIcon className="h-5 w-5" />
        </button>
      </div>

      {/* Support: thread selector */}
      {isSupport && conversationUserIds.length > 0 && (
        <div className="px-4 py-2 border-b border-gray-100 bg-gray-50/50">
          <label className="block text-xs font-medium text-gray-500 mb-1">
            Reply to conversation
          </label>
          <select
            value={selectedConversationUserId ?? ""}
            onChange={(e) => setSelectedConversationUserId(e.target.value || null)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500"
          >
            {conversationUserIds.map((uid) => (
              <option key={uid} value={uid}>
                {participantNameByUserId[uid] ?? `Student ${uid.slice(0, 8)}…`}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Status */}
      <div className="px-4 py-2 border-b border-gray-100 bg-gray-50/50 flex items-center gap-2 text-sm">
        {!accessToken && (
          <span className="text-amber-600">Please log in to use chat.</span>
        )}
        {accessToken && !connected && !connectionFailed && (
          <span className="text-amber-600">Connecting…</span>
        )}
        {accessToken && connectionFailed && (
          <span className="text-red-600">
            Connection failed. Check that the backend is running and try again.
          </span>
        )}
        {accessToken && connected && joinOk === false && (
          <span className="text-red-600">
            You must be enrolled in this course to use chat.
          </span>
        )}
        {accessToken && connected && joinOk === true && (
          <span className="text-green-600">● Live</span>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0">
        {messages.length === 0 && (
          <p className="text-sm text-gray-500 text-center py-8">
            No messages yet. Say hello or ask a question about the course.
          </p>
        )}
        {messages.map((msg) => {
          const isOwn = currentUserId && msg.user_id === currentUserId;
          const senderLabel =
            participantNameByUserId[msg.user_id] ?? (msg.role ? String(msg.role).charAt(0).toUpperCase() + String(msg.role).slice(1).toLowerCase() : "User");
          return (
            <div
              key={msg.message_id}
              className={`flex flex-col max-w-[85%] ${isOwn ? "ml-auto items-end" : "mr-auto items-start"}`}
            >
              <div className="flex items-baseline gap-2 mb-0.5">
                <span className="text-xs font-medium text-purple-600">
                  {senderLabel}
                </span>
                <span className="text-xs text-gray-400">
                  {formatRelativeTime(msg.created_at)}
                </span>
              </div>
              <div
                className={`px-3 py-2 rounded-lg text-sm break-words ${
                  isOwn
                    ? "bg-purple-600 text-white rounded-br-none"
                    : "bg-gray-100 text-gray-900 rounded-bl-none"
                }`}
              >
                {msg.content}
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        {sendError && (
          <p className="text-sm text-red-600 mb-2">{sendError}</p>
        )}
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
            placeholder="Type a message…"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            disabled={!connected || joinOk !== true}
          />
          <button
            type="button"
            onClick={handleSend}
            disabled={!canSend}
            className="p-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
            aria-label="Send message"
          >
            <PaperAirplaneIcon className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

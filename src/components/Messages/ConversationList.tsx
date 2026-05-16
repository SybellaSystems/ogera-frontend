import React, { useMemo } from 'react';
import type { IConversation } from '@/types/message.types';
import {
  ChatBubbleLeftRightIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';

interface ConversationListProps {
  conversations: IConversation[];
  currentUserId?: string;
  selectedConversation: IConversation | null;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onSelectConversation: (conversation: IConversation) => void;
  loading: boolean;
  typingConversationIds?: string[];
  onlineUserIds?: string[];
}

const formatConversationTime = (value?: string) => {
  if (!value) return '';
  const date = new Date(value);
  const now = new Date();
  const sameDay = date.toDateString() === now.toDateString();
  const yesterday = new Date();
  yesterday.setDate(now.getDate() - 1);

  if (sameDay) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  if (date.toDateString() === yesterday.toDateString()) {
    return 'Yesterday';
  }

  return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
};

const getLastMessagePreview = (conversation: IConversation) => {
  const lastMessage = conversation.lastMessage;
  if (!lastMessage) return 'No messages yet';
  if (lastMessage.content?.trim()) return lastMessage.content;
  if (lastMessage.file_name) return `Attachment: ${lastMessage.file_name}`;
  return 'Sent an attachment';
};

const resolveAvatarUrl = (value?: string) => {
  if (!value) return '';
  if (value.startsWith('http://') || value.startsWith('https://')) return value;
  const apiBaseUrl =
    (import.meta.env.VITE_API_URL || 'https://api.ogera.sybellasystems.co.rw/api').replace('/api', '');
  return `${apiBaseUrl}${value.startsWith('/') ? value : `/${value}`}`;
};

const ConversationList: React.FC<ConversationListProps> = ({
  conversations,
  currentUserId,
  selectedConversation,
  searchQuery,
  onSearchChange,
  onSelectConversation,
  loading,
  typingConversationIds = [],
  onlineUserIds = [],
}) => {
  const filteredConversations = useMemo(() => {
    if (!searchQuery.trim()) return conversations;

    const query = searchQuery.toLowerCase();
    return conversations.filter((conversation) => {
      const otherUser =
        currentUserId === conversation.employer_id
          ? conversation.student?.full_name || ''
          : conversation.employer?.full_name || '';
      const jobTitle = conversation.job?.job_title || '';

      return (
        otherUser.toLowerCase().includes(query) ||
        jobTitle.toLowerCase().includes(query) ||
        getLastMessagePreview(conversation).toLowerCase().includes(query)
      );
    });
  }, [conversations, currentUserId, searchQuery]);

  return (
    <aside className="flex h-full flex-col bg-white/95">
      <div className="sticky top-0 z-10 border-b border-slate-200 bg-white/95 px-4 py-4 backdrop-blur md:px-5">
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-slate-900">Inbox</h2>
          <p className="mt-1 text-sm text-slate-500">
            Keep every project conversation in one place.
          </p>
        </div>

        <label className="relative block">
          <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search people, jobs, or messages"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm text-slate-700 outline-none transition focus:border-indigo-300 focus:bg-white focus:ring-4 focus:ring-indigo-100"
          />
        </label>
      </div>

      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="space-y-3 p-4">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="rounded-3xl border border-slate-100 bg-white p-4 shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 animate-pulse rounded-2xl bg-slate-200" />
                  <div className="min-w-0 flex-1 space-y-2">
                    <div className="h-4 w-2/3 animate-pulse rounded-full bg-slate-200" />
                    <div className="h-3 w-1/2 animate-pulse rounded-full bg-slate-100" />
                    <div className="h-3 w-4/5 animate-pulse rounded-full bg-slate-100" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : null}

        {!loading && filteredConversations.length === 0 ? (
          <div className="flex min-h-[22rem] flex-col items-center justify-center px-6 text-center">
            <div className="rounded-3xl bg-indigo-50 p-4 text-indigo-600">
              <ChatBubbleLeftRightIcon className="h-8 w-8" />
            </div>
            <h3 className="mt-5 text-base font-semibold text-slate-900">
              {searchQuery ? 'No conversations found' : 'No conversations yet'}
            </h3>
            <p className="mt-2 max-w-xs text-sm text-slate-500">
              {searchQuery
                ? 'Try another search term or open a different project conversation.'
                : 'Once a job is approved, the conversation will appear here automatically.'}
            </p>
          </div>
        ) : null}

        {!loading &&
          filteredConversations.map((conversation) => {
            const otherUser =
              currentUserId === conversation.employer_id
                ? conversation.student
                : conversation.employer;
            const isSelected =
              selectedConversation?.conversation_id === conversation.conversation_id;
            const isTyping = typingConversationIds.includes(conversation.conversation_id);
            const isOnline = otherUser?.user_id
              ? onlineUserIds.includes(otherUser.user_id)
              : false;
            const unreadCount = conversation.unreadCount || 0;

            return (
              <button
                key={conversation.conversation_id}
                type="button"
                onClick={() => onSelectConversation(conversation)}
                className={`group w-full px-4 py-3 text-left transition md:px-5 ${
                  isSelected ? 'bg-indigo-50/90' : 'hover:bg-slate-50'
                }`}
              >
                <div
                  className={`rounded-3xl border p-4 shadow-sm transition ${
                    isSelected
                      ? 'border-indigo-200 bg-white shadow-indigo-100'
                      : 'border-transparent bg-white/80 group-hover:border-slate-200'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="relative shrink-0">
                      {otherUser?.profile_image_url ? (
                        <img
                          src={resolveAvatarUrl(otherUser.profile_image_url)}
                          alt={otherUser.full_name}
                          className="h-12 w-12 rounded-2xl object-cover"
                        />
                      ) : (
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 via-violet-500 to-sky-500 text-sm font-semibold text-white shadow-sm">
                          {otherUser?.full_name?.slice(0, 1).toUpperCase() || '?'}
                        </div>
                      )}
                      <span
                        className={`absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-white ${
                          isOnline ? 'bg-emerald-500' : 'bg-slate-300'
                        }`}
                      />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p
                            className={`truncate text-sm font-semibold ${
                              unreadCount > 0 ? 'text-slate-950' : 'text-slate-900'
                            }`}
                          >
                            {otherUser?.full_name || 'Unknown user'}
                          </p>
                          <p className="truncate text-xs text-slate-500">
                            {conversation.job?.job_title || 'General conversation'}
                          </p>
                        </div>

                        <div className="flex shrink-0 flex-col items-end gap-2">
                          <span className="text-xs font-medium text-slate-400">
                            {formatConversationTime(conversation.last_message_at)}
                          </span>
                          {unreadCount > 0 ? (
                            <span className="inline-flex min-w-6 items-center justify-center rounded-full bg-indigo-600 px-2 py-0.5 text-[11px] font-semibold text-white">
                              {unreadCount > 99 ? '99+' : unreadCount}
                            </span>
                          ) : null}
                        </div>
                      </div>

                      <div className="mt-3 flex items-center gap-2">
                        {isTyping ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-[11px] font-semibold text-emerald-700">
                            <span className="flex gap-1">
                              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-emerald-500 [animation-delay:-0.2s]" />
                              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-emerald-500 [animation-delay:-0.1s]" />
                              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-emerald-500" />
                            </span>
                            Typing...
                          </span>
                        ) : (
                          <p
                            className={`line-clamp-1 text-sm ${
                              unreadCount > 0
                                ? 'font-medium text-slate-700'
                                : 'text-slate-500'
                            }`}
                          >
                            {getLastMessagePreview(conversation)}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
      </div>
    </aside>
  );
};

export default ConversationList;

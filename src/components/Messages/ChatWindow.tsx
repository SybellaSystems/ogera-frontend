import React, { useEffect, useMemo, useRef, useState } from 'react';
import type { IConversation, IMessage } from '@/types/message.types';
import {
  ArrowDownTrayIcon,
  ChatBubbleLeftRightIcon,
  FaceSmileIcon,
  PaperAirplaneIcon,
  PaperClipIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { useSelector } from 'react-redux';

interface ChatWindowProps {
  conversation: IConversation | null;
  messages: IMessage[];
  loading: boolean;
  loadingOlder?: boolean;
  hasMore?: boolean;
  onLoadOlder?: () => void;
  onSendMessage: (content: string, file?: File) => void;
  onTypingStart?: () => void;
  onTypingStop?: () => void;
  sendLoading?: boolean;
  otherUserOnline?: boolean;
  otherUserLastSeenAt?: string | null;
  isOtherUserTyping?: boolean;
}

const formatMessageTime = (dateString: string) =>
  new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

const formatMessageDate = (dateString: string) =>
  new Date(dateString).toLocaleDateString([], {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

const isSameDay = (left: string, right: string) =>
  new Date(left).toDateString() === new Date(right).toDateString();

const getLastSeenLabel = (value?: string | null) => {
  if (!value) return 'Offline';
  const date = new Date(value);
  return `Last active ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
};

const ChatWindow: React.FC<ChatWindowProps> = ({
  conversation,
  messages,
  loading,
  loadingOlder = false,
  hasMore = false,
  onLoadOlder,
  onSendMessage,
  onTypingStart,
  onTypingStop,
  sendLoading = false,
  otherUserOnline = false,
  otherUserLastSeenAt,
  isOtherUserTyping = false,
}) => {
  const [messageContent, setMessageContent] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<number | null>(null);
  const isTypingRef = useRef(false);
  const currentUserId = useSelector((state: any) => state.auth.user?.user_id);
  const apiBaseUrl =
    (import.meta.env.VITE_API_URL || 'https://api.ogera.sybellasystems.co.rw/api').replace('/api', '');

  const otherUser = useMemo(() => {
    if (!conversation) return null;
    return currentUserId === conversation.employer_id
      ? conversation.student
      : conversation.employer;
  }, [conversation, currentUserId]);

  const latestMessageId = messages[messages.length - 1]?.message_id;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [latestMessageId, conversation?.conversation_id]);

  useEffect(() => {
    setMessageContent('');
    setSelectedFile(null);
    if (typingTimeoutRef.current) {
      window.clearTimeout(typingTimeoutRef.current);
    }
    if (isTypingRef.current) {
      onTypingStop?.();
      isTypingRef.current = false;
    }
  }, [conversation?.conversation_id, onTypingStop]);

  const triggerTypingState = (nextValue: string) => {
    if (!onTypingStart || !onTypingStop) return;

    if (nextValue.trim() && !isTypingRef.current) {
      isTypingRef.current = true;
      onTypingStart();
    }

    if (typingTimeoutRef.current) {
      window.clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = window.setTimeout(() => {
      if (isTypingRef.current) {
        onTypingStop();
        isTypingRef.current = false;
      }
    }, 1400);

    if (!nextValue.trim() && isTypingRef.current) {
      onTypingStop();
      isTypingRef.current = false;
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageContent.trim() && !selectedFile) return;

    onSendMessage(messageContent, selectedFile || undefined);
    setMessageContent('');
    setSelectedFile(null);

    if (typingTimeoutRef.current) {
      window.clearTimeout(typingTimeoutRef.current);
    }
    if (isTypingRef.current) {
      onTypingStop?.();
      isTypingRef.current = false;
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setSelectedFile(file);
  };

  const resolveFileUrl = (url?: string | null) => {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    return `${apiBaseUrl}${url.startsWith('/') ? url : `/${url}`}`;
  };

  const groupedMessages = useMemo(
    () =>
      messages.map((message, index) => ({
        message,
        showDateSeparator:
          index === 0 || !isSameDay(message.created_at, messages[index - 1].created_at),
        showAvatar:
          index === messages.length - 1 ||
          messages[index + 1]?.sender_id !== message.sender_id,
      })),
    [messages]
  );

  const renderStatusLabel = (message: IMessage) => {
    if (message.sender_id !== currentUserId) return null;
    if (message.read_status) return 'Seen';
    if (message.delivered_at) return 'Delivered';
    return 'Sent';
  };

  if (!conversation) {
    return (
      <div className="flex h-full flex-col items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(99,102,241,0.12),_transparent_40%),linear-gradient(180deg,#f8fafc_0%,#ffffff_100%)] px-6">
        <div className="max-w-md text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-white shadow-sm ring-1 ring-slate-200">
            <ChatBubbleLeftRightIcon className="h-8 w-8 text-indigo-600" />
          </div>
          <h3 className="mt-6 text-xl font-semibold text-slate-900">Select a conversation</h3>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            Open any conversation to send updates, share files, and track message status in real time.
          </p>
        </div>
      </div>
    );
  }

  return (
    <section className="flex h-full flex-col bg-white">
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/95 px-4 py-4 backdrop-blur md:px-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3">
            <div className="relative">
              {otherUser?.profile_image_url ? (
                <img
                  src={resolveFileUrl(otherUser.profile_image_url)}
                  alt={otherUser.full_name}
                  className="h-12 w-12 rounded-2xl object-cover"
                />
              ) : (
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 via-violet-500 to-sky-500 text-sm font-semibold text-white">
                  {otherUser?.full_name?.slice(0, 1).toUpperCase() || '?'}
                </div>
              )}
              <span
                className={`absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-white ${
                  otherUserOnline ? 'bg-emerald-500' : 'bg-slate-300'
                }`}
              />
            </div>

            <div className="min-w-0">
              <h2 className="truncate text-base font-semibold text-slate-900">
                {otherUser?.full_name || 'Unknown'}
              </h2>
              <div className="mt-0.5 flex flex-wrap items-center gap-2 text-sm text-slate-500">
                <span className="truncate">{conversation.job?.job_title || 'Conversation'}</span>
                <span className="text-slate-300">•</span>
                <span className={otherUserOnline ? 'text-emerald-600' : 'text-slate-500'}>
                  {otherUserOnline ? 'Online now' : getLastSeenLabel(otherUserLastSeenAt)}
                </span>
              </div>
            </div>
          </div>

          <div className="hidden items-center gap-2 md:flex">
            <button
              type="button"
              className="rounded-2xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-500 transition hover:border-slate-300 hover:bg-slate-50"
            >
              <PaperClipIcon className="h-4 w-4" />
            </button>
            <button
              type="button"
              className="rounded-2xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-500 transition hover:border-slate-300 hover:bg-slate-50"
            >
              <FaceSmileIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto bg-[radial-gradient(circle_at_top,_rgba(99,102,241,0.10),_transparent_35%),linear-gradient(180deg,#f8fafc_0%,#ffffff_35%,#ffffff_100%)] px-4 py-5 md:px-6"
      >
        {loading ? (
          <div className="space-y-5">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className={`flex ${index % 2 === 0 ? 'justify-start' : 'justify-end'}`}
              >
                <div className="max-w-[75%] space-y-2">
                  <div className="h-14 w-14 animate-pulse rounded-2xl bg-slate-100" />
                  <div className="h-4 w-48 animate-pulse rounded-full bg-slate-100" />
                  <div className="h-4 w-32 animate-pulse rounded-full bg-slate-100" />
                </div>
              </div>
            ))}
          </div>
        ) : null}

        {!loading && hasMore ? (
          <div className="mb-5 flex justify-center">
            <button
              type="button"
              onClick={onLoadOlder}
              disabled={loadingOlder}
              className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loadingOlder ? 'Loading earlier messages...' : 'Load earlier messages'}
            </button>
          </div>
        ) : null}

        {!loading && messages.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <div className="max-w-sm rounded-[2rem] border border-dashed border-slate-200 bg-white/85 px-8 py-10 text-center shadow-sm">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-3xl bg-indigo-50 text-indigo-600">
                <ChatBubbleLeftRightIcon className="h-7 w-7" />
              </div>
              <h3 className="mt-4 text-base font-semibold text-slate-900">Start the conversation</h3>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Share updates, clarify expectations, or send files to keep this job moving.
              </p>
            </div>
          </div>
        ) : null}

        {!loading &&
          groupedMessages.map(({ message, showDateSeparator, showAvatar }) => {
            const isCurrentUser = message.sender_id === currentUserId;
            const statusLabel = renderStatusLabel(message);

            return (
              <React.Fragment key={message.message_id}>
                {showDateSeparator ? (
                  <div className="my-5 flex items-center justify-center">
                    <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-500 shadow-sm">
                      {formatMessageDate(message.created_at)}
                    </span>
                  </div>
                ) : null}

                <div className={`mb-3 flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`flex max-w-[85%] gap-3 md:max-w-[72%] ${
                      isCurrentUser ? 'flex-row-reverse' : 'flex-row'
                    }`}
                  >
                    <div className="w-9 shrink-0">
                      {showAvatar ? (
                        message.sender?.profile_image_url ? (
                          <img
                            src={resolveFileUrl(message.sender.profile_image_url)}
                            alt={message.sender.full_name}
                            className="h-9 w-9 rounded-2xl object-cover"
                          />
                        ) : (
                          <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-slate-200 text-xs font-semibold text-slate-700">
                            {message.sender?.full_name?.slice(0, 1).toUpperCase() || '?'}
                          </div>
                        )
                      ) : null}
                    </div>

                    <div className={`min-w-0 ${isCurrentUser ? 'items-end' : 'items-start'}`}>
                      <div
                        className={`overflow-hidden rounded-[1.6rem] border px-4 py-3 shadow-sm transition hover:-translate-y-0.5 ${
                          isCurrentUser
                            ? 'border-indigo-500/30 bg-gradient-to-br from-indigo-600 via-violet-600 to-sky-600 text-white'
                            : 'border-white/70 bg-white text-slate-900'
                        }`}
                      >
                        {message.file_url ? (
                          <div className={`${message.content ? 'mb-3' : ''}`}>
                            {message.file_type?.startsWith('image/') ? (
                              <img
                                src={resolveFileUrl(message.file_url)}
                                alt="Message attachment"
                                className="max-h-72 w-full rounded-2xl object-cover"
                              />
                            ) : (
                              <div
                                className={`flex items-center gap-3 rounded-2xl p-3 ${
                                  isCurrentUser ? 'bg-white/10' : 'bg-slate-50'
                                }`}
                              >
                                <div className="rounded-2xl bg-white/80 p-2 text-slate-700 shadow-sm">
                                  <PaperClipIcon className="h-5 w-5" />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <p className="truncate text-sm font-semibold">
                                    {message.file_name || 'Attachment'}
                                  </p>
                                  <p
                                    className={`text-xs ${
                                      isCurrentUser ? 'text-white/80' : 'text-slate-500'
                                    }`}
                                  >
                                    {message.file_type || 'File'}
                                  </p>
                                </div>
                                <a
                                  href={resolveFileUrl(message.file_url)}
                                  download={message.file_name || undefined}
                                  className={`rounded-full p-2 transition ${
                                    isCurrentUser
                                      ? 'bg-white/15 hover:bg-white/25'
                                      : 'bg-white hover:bg-slate-100'
                                  }`}
                                >
                                  <ArrowDownTrayIcon className="h-4 w-4" />
                                </a>
                              </div>
                            )}
                          </div>
                        ) : null}

                        {message.content ? (
                          <p className="whitespace-pre-wrap break-words text-sm leading-6">
                            {message.content}
                          </p>
                        ) : null}
                      </div>

                      <div
                        className={`mt-1 flex items-center gap-2 px-1 text-[11px] ${
                          isCurrentUser ? 'justify-end text-slate-400' : 'justify-start text-slate-400'
                        }`}
                      >
                        <span>{formatMessageTime(message.created_at)}</span>
                        {statusLabel ? <span className="font-semibold">{statusLabel}</span> : null}
                      </div>
                    </div>
                  </div>
                </div>
              </React.Fragment>
            );
          })}

        {!loading && isOtherUserTyping ? (
          <div className="mt-3 flex justify-start">
            <div className="flex items-center gap-3 rounded-full bg-white px-4 py-2 text-sm text-slate-500 shadow-sm ring-1 ring-slate-200">
              <span className="flex gap-1">
                <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400 [animation-delay:-0.2s]" />
                <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400 [animation-delay:-0.1s]" />
                <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400" />
              </span>
              {otherUser?.full_name?.split(' ')[0] || 'Someone'} is typing...
            </div>
          </div>
        ) : null}

        <div ref={messagesEndRef} />
      </div>

      <form
        onSubmit={handleSendMessage}
        className="border-t border-slate-200 bg-white/95 px-4 py-4 backdrop-blur md:px-6"
      >
        {selectedFile ? (
          <div className="mb-3 flex items-center justify-between rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-slate-900">{selectedFile.name}</p>
              <p className="text-xs text-slate-500">
                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB attached
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setSelectedFile(null);
                if (fileInputRef.current) fileInputRef.current.value = '';
              }}
              className="rounded-full p-2 text-slate-500 transition hover:bg-white hover:text-slate-700"
            >
              <XMarkIcon className="h-4 w-4" />
            </button>
          </div>
        ) : null}

        <div className="flex items-end gap-3 rounded-[2rem] border border-slate-200 bg-white p-2 shadow-sm">
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileSelect}
            disabled={sendLoading}
            className="hidden"
          />

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={sendLoading}
            className="rounded-full p-3 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed"
            title="Attach file"
          >
            <PaperClipIcon className="h-5 w-5" />
          </button>

          <button
            type="button"
            className="rounded-full p-3 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
            title="Emoji picker coming soon"
          >
            <FaceSmileIcon className="h-5 w-5" />
          </button>

          <textarea
            rows={1}
            value={messageContent}
            onChange={(e) => {
              setMessageContent(e.target.value);
              triggerTypingState(e.target.value);
            }}
            placeholder="Write a message"
            disabled={sendLoading}
            className="max-h-32 min-h-[48px] flex-1 resize-none border-0 bg-transparent px-1 py-3 text-sm leading-6 text-slate-700 outline-none placeholder:text-slate-400 disabled:cursor-not-allowed"
          />

          <button
            type="submit"
            disabled={sendLoading || (!messageContent.trim() && !selectedFile)}
            className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-indigo-600 via-violet-600 to-sky-600 text-white shadow-lg shadow-indigo-200 transition hover:scale-[1.02] hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Send message"
          >
            <PaperAirplaneIcon className="h-5 w-5" />
          </button>
        </div>
      </form>
    </section>
  );
};

export default ChatWindow;

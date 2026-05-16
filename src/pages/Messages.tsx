import React, { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { skipToken } from '@reduxjs/toolkit/query/react';
import { useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ArrowPathIcon } from '@heroicons/react/24/outline';
import ConversationList from '@/components/Messages/ConversationList';
import ChatWindow from '@/components/Messages/ChatWindow';
import {
  useGetConversationsQuery,
  useGetMessagesQuery,
  useMarkConversationReadMutation,
  useSendMessageMutation,
} from '@/services/api/messagesApi';
import {
  emitTypingStart,
  emitTypingStop,
  getSocket,
  joinConversationRoom,
  leaveConversationRoom,
} from '@/utils/socket';
import type { IConversation, IMessage } from '@/types/message.types';

const PAGE_SIZE = 30;

const dedupeMessages = (items: IMessage[]) => {
  const seen = new Map<string, IMessage>();
  items.forEach((item) => seen.set(item.message_id, item));
  return Array.from(seen.values()).sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );
};

const sortConversations = (items: IConversation[]) =>
  [...items].sort((a, b) => {
    const left = a.last_message_at || a.created_at;
    const right = b.last_message_at || b.created_at;
    return new Date(right).getTime() - new Date(left).getTime();
  });

const Messages: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedConversationIdFromQuery = searchParams.get('conversationId');

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(
    selectedConversationIdFromQuery
  );
  const [conversations, setConversations] = useState<IConversation[]>([]);
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [messageOffset, setMessageOffset] = useState(0);
  const [hasMoreMessages, setHasMoreMessages] = useState(false);
  const [typingConversationIds, setTypingConversationIds] = useState<string[]>([]);
  const [typingUsers, setTypingUsers] = useState<Record<string, boolean>>({});
  const [presenceByUserId, setPresenceByUserId] = useState<
    Record<string, { is_online: boolean; last_seen_at?: string | null }>
  >({});

  const currentUserId = useSelector((state: any) => state.auth.user?.user_id);
  const userRole = useSelector((state: any) => state.auth.role);
  const accessToken = useSelector((state: any) => state.auth.accessToken);

  const {
    data: conversationsData,
    isLoading: conversationsLoading,
    error: conversationsError,
    refetch: refetchConversations,
  } = useGetConversationsQuery(undefined, {
    pollingInterval: 30000,
    refetchOnFocus: true,
    refetchOnReconnect: true,
  });

  const selectedConversation = useMemo(
    () =>
      conversations.find(
        (conversation) => conversation.conversation_id === selectedConversationId
      ) || null,
    [conversations, selectedConversationId]
  );

  const {
    data: messagesData,
    isLoading: messagesLoading,
    isFetching: isFetchingMessages,
    error: messagesError,
    refetch: refetchMessages,
  } = useGetMessagesQuery(
    selectedConversation
      ? {
          conversationId: selectedConversation.conversation_id,
          limit: PAGE_SIZE,
          offset: messageOffset,
        }
      : skipToken,
    {
      refetchOnFocus: true,
      refetchOnReconnect: true,
    }
  );

  const [sendMessage, { isLoading: sendLoading }] = useSendMessageMutation();
  const [markConversationRead] = useMarkConversationReadMutation();

  useEffect(() => {
    const nextConversations = sortConversations(conversationsData?.data || []);
    setConversations(nextConversations);
  }, [conversationsData]);

  useEffect(() => {
    if (!selectedConversationIdFromQuery) return;
    setSelectedConversationId(selectedConversationIdFromQuery);
    setMessages([]);
    setMessageOffset(0);
  }, [selectedConversationIdFromQuery]);

  useEffect(() => {
    if (!selectedConversationId && conversations.length > 0) {
      const fallbackConversationId =
        selectedConversationIdFromQuery &&
        conversations.some(
          (conversation) => conversation.conversation_id === selectedConversationIdFromQuery
        )
          ? selectedConversationIdFromQuery
          : conversations[0].conversation_id;

      setSelectedConversationId(fallbackConversationId);
      setSearchParams({ conversationId: fallbackConversationId });
    }
  }, [conversations, selectedConversationId, selectedConversationIdFromQuery, setSearchParams]);

  useEffect(() => {
    if (!messagesData?.data) {
      if (!selectedConversation) {
        setMessages([]);
        setHasMoreMessages(false);
      }
      return;
    }

    const nextPage = dedupeMessages(messagesData.data);
    setHasMoreMessages((messagesData.total || 0) > messageOffset + nextPage.length);
    setMessages((prev) =>
      messageOffset === 0 ? nextPage : dedupeMessages([...nextPage, ...prev])
    );
  }, [messageOffset, messagesData, selectedConversation]);

  useEffect(() => {
    if (!selectedConversation?.conversation_id) return;
    if ((selectedConversation.unreadCount || 0) === 0) return;

    markConversationRead(selectedConversation.conversation_id)
      .unwrap()
      .then(() => {
        refetchConversations();
      })
      .catch(() => undefined);
  }, [markConversationRead, refetchConversations, selectedConversation]);

  useEffect(() => {
    if (!accessToken || !selectedConversation?.conversation_id) return;

    joinConversationRoom(selectedConversation.conversation_id, () => accessToken);

    return () => {
      leaveConversationRoom(selectedConversation.conversation_id, () => accessToken);
    };
  }, [accessToken, selectedConversation?.conversation_id]);

  useEffect(() => {
    if (!accessToken) return;

    const socket = getSocket(() => accessToken);
    if (!socket) return;

    const handleNewMessage = async (payload: {
      conversation_id?: string;
      message?: IMessage;
    }) => {
      const incomingMessage = payload.message;
      if (!incomingMessage) return;

      setConversations((prev) =>
        sortConversations(
          prev.map((conversation) => {
            if (conversation.conversation_id !== incomingMessage.conversation_id) {
              return conversation;
            }

            const isCurrentConversation =
              conversation.conversation_id === selectedConversationId;
            const nextUnreadCount =
              incomingMessage.sender_id === currentUserId || isCurrentConversation
                ? 0
                : (conversation.unreadCount || 0) + 1;

            return {
              ...conversation,
              lastMessage: incomingMessage,
              last_message_at: incomingMessage.created_at,
              unreadCount: nextUnreadCount,
            };
          })
        )
      );

      if (incomingMessage.conversation_id === selectedConversationId) {
        setMessages((prev) => dedupeMessages([...prev, incomingMessage]));

        if (incomingMessage.sender_id !== currentUserId) {
          try {
            await markConversationRead(incomingMessage.conversation_id).unwrap();
            await refetchConversations();
          } catch {
            // Best effort only.
          }
        }
      } else {
        refetchConversations();
      }
    };

    const handleMessagesRead = (payload: {
      conversation_id?: string;
      reader_id?: string;
      read_at?: string;
    }) => {
      if (!payload.conversation_id) return;
      if (payload.conversation_id !== selectedConversationId) return;

      setMessages((prev) =>
        prev.map((message) =>
          message.sender_id === currentUserId
            ? { ...message, read_status: true }
            : message
        )
      );
    };

    const handleMessageDelivered = (payload: {
      message_id?: string;
      delivered_at?: string;
    }) => {
      if (!payload.message_id) return;

      setMessages((prev) =>
        prev.map((message) =>
          message.message_id === payload.message_id
            ? {
                ...message,
                delivered_at: payload.delivered_at || new Date().toISOString(),
              }
            : message
        )
      );
    };

    const handleTyping = (payload: {
      conversation_id?: string;
      user_id?: string;
      is_typing?: boolean;
    }) => {
      if (!payload.conversation_id || !payload.user_id || payload.user_id === currentUserId) {
        return;
      }

      const conversationId = payload.conversation_id;
      const typingUserId = payload.user_id;

      setTypingConversationIds((prev) => {
        const set = new Set(prev);
        if (payload.is_typing) {
          set.add(conversationId);
        } else {
          set.delete(conversationId);
        }
        return Array.from(set);
      });

      setTypingUsers((prev) => ({
        ...prev,
        [typingUserId]: Boolean(payload.is_typing),
      }));
    };

    const handlePresence = (payload: {
      user_id?: string;
      is_online?: boolean;
      last_seen_at?: string | null;
    }) => {
      if (!payload.user_id) return;
      const presenceUserId = payload.user_id;

      setPresenceByUserId((prev) => ({
        ...prev,
        [presenceUserId]: {
          is_online: Boolean(payload.is_online),
          last_seen_at: payload.last_seen_at,
        },
      }));
    };

    socket.on('message:new', handleNewMessage);
    socket.on('messages:read', handleMessagesRead);
    socket.on('message:delivered', handleMessageDelivered);
    socket.on('conversation:typing', handleTyping);
    socket.on('conversation:presence', handlePresence);

    return () => {
      socket.off('message:new', handleNewMessage);
      socket.off('messages:read', handleMessagesRead);
      socket.off('message:delivered', handleMessageDelivered);
      socket.off('conversation:typing', handleTyping);
      socket.off('conversation:presence', handlePresence);
    };
  }, [
    accessToken,
    currentUserId,
    markConversationRead,
    refetchConversations,
    selectedConversationId,
  ]);

  const handleSelectConversation = async (conversation: IConversation) => {
    setSelectedConversationId(conversation.conversation_id);
    setSearchParams({ conversationId: conversation.conversation_id });
    setMessages([]);
    setMessageOffset(0);

    if ((conversation.unreadCount || 0) > 0) {
      try {
        await markConversationRead(conversation.conversation_id).unwrap();
        await refetchConversations();
      } catch {
        // Best effort only.
      }
    }
  };

  const handleSendMessage = async (content: string, file?: File) => {
    if (!selectedConversation) return;

    try {
      const result = await sendMessage({
        conversationId: selectedConversation.conversation_id,
        content,
        file,
      }).unwrap();

      if (result.data) {
        setMessages((prev) => dedupeMessages([...prev, result.data]));
        setConversations((prev) =>
          sortConversations(
            prev.map((conversation) =>
              conversation.conversation_id === selectedConversation.conversation_id
                ? {
                    ...conversation,
                    lastMessage: result.data,
                    last_message_at: result.data.created_at,
                  }
                : conversation
            )
          )
        );
      }
    } catch (error: any) {
      toast.error(error?.data?.message || 'Failed to send message');
    }
  };

  const otherUser =
    selectedConversation && currentUserId === selectedConversation.employer_id
      ? selectedConversation.student
      : selectedConversation?.employer;

  const otherUserPresence = otherUser?.user_id
    ? presenceByUserId[otherUser.user_id]
    : undefined;

  return (
    <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_20px_70px_rgba(15,23,42,0.08)]">
      <div className="flex items-center justify-between border-b border-slate-200 px-4 py-4 md:px-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-950">Messages</h1>
          <p className="mt-1 text-sm text-slate-500">
            {userRole === 'employer'
              ? 'Stay aligned with approved students in real time.'
              : 'Keep project conversations moving with employers.'}
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            refetchConversations();
            if (selectedConversation) refetchMessages();
          }}
          className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:border-slate-300 hover:bg-slate-50"
        >
          <ArrowPathIcon className={`h-4 w-4 ${isFetchingMessages ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      <div className="grid min-h-[calc(100vh-14rem)] grid-cols-1 overflow-hidden lg:grid-cols-[360px_minmax(0,1fr)]">
        <div className="border-b border-slate-200 lg:border-b-0 lg:border-r">
          <ConversationList
            conversations={conversations}
            currentUserId={currentUserId}
            selectedConversation={selectedConversation}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onSelectConversation={handleSelectConversation}
            loading={conversationsLoading}
            typingConversationIds={typingConversationIds}
            onlineUserIds={Object.entries(presenceByUserId)
              .filter(([, value]) => value.is_online)
              .map(([userId]) => userId)}
          />
        </div>

        <div className="min-h-[28rem]">
          <ChatWindow
            conversation={selectedConversation}
            messages={messages}
            loading={messagesLoading && messageOffset === 0}
            loadingOlder={isFetchingMessages && messageOffset > 0}
            hasMore={hasMoreMessages}
            onLoadOlder={() => setMessageOffset((prev) => prev + PAGE_SIZE)}
            onSendMessage={handleSendMessage}
            onTypingStart={() =>
              selectedConversation && accessToken
                ? emitTypingStart(selectedConversation.conversation_id, () => accessToken)
                : undefined
            }
            onTypingStop={() =>
              selectedConversation && accessToken
                ? emitTypingStop(selectedConversation.conversation_id, () => accessToken)
                : undefined
            }
            sendLoading={sendLoading}
            otherUserOnline={Boolean(otherUserPresence?.is_online)}
            otherUserLastSeenAt={otherUserPresence?.last_seen_at}
            isOtherUserTyping={Boolean(otherUser?.user_id && typingUsers[otherUser.user_id])}
          />
        </div>
      </div>

      {conversationsError ? (
        <div className="m-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          Failed to load conversations.
        </div>
      ) : null}

      {messagesError && selectedConversation ? (
        <div className="mx-4 mb-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          Failed to load messages for this conversation.
        </div>
      ) : null}
    </div>
  );
};

export default Messages;

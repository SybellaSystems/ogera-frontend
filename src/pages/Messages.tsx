import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { skipToken } from '@reduxjs/toolkit/query/react';
import toast from 'react-hot-toast';
import ConversationList from '@/components/Messages/ConversationList';
import ChatWindow from '@/components/Messages/ChatWindow';
import {
  useGetConversationsQuery,
  useGetMessagesQuery,
  useSendMessageMutation,
} from '@/services/api/messagesApi';
import type { IConversation, IMessage } from '@/types/message.types';

const Messages: React.FC = () => {
  const { t: _t } = useTranslation(); // Suppress unused warning
  const [selectedConversation, setSelectedConversation] =
    useState<IConversation | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [messages, setMessages] = useState<IMessage[]>([]);

  const currentUserId = useSelector((state: any) => state.auth.user?.user_id);
  const userRole = useSelector((state: any) => state.auth.role);

  // Fetch conversations
  const {
    data: conversationsData,
    isLoading: conversationsLoading,
    error: conversationsError,
  } = useGetConversationsQuery();

  // Fetch messages for selected conversation
  const {
    data: messagesData,
    isLoading: messagesLoading,
    error: messagesError,
  } = useGetMessagesQuery(
    selectedConversation 
      ? { conversationId: selectedConversation.conversation_id } 
      : skipToken
  );

  // Debug logging - moved after all hooks are declared
  useEffect(() => {
    console.log('[Messages] Auth state:', { currentUserId, userRole });
    if (conversationsError) {
      console.error('[Messages] Conversations fetch error:', conversationsError);
    }
    if (messagesError) {
      console.error('[Messages] Messages fetch error:', messagesError);
    }
  }, [currentUserId, userRole, conversationsError, messagesError]);

  // Send message mutation
  const [sendMessage, { isLoading: sendLoading }] = useSendMessageMutation();

  // Update messages when fetched
  useEffect(() => {
    if (messagesData?.data) {
      setMessages(messagesData.data);
    }
  }, [messagesData]);

  // Handle sending message
  const handleSendMessage = async (content: string, file?: File) => {
    if (!selectedConversation) return;

    try {
      const result = await sendMessage({
        conversationId: selectedConversation.conversation_id,
        content,
        file,
      }).unwrap();

      // Add sent message to local state
      if (result.data) {
        setMessages((prev) => [...prev, result.data]);
      }

      toast.success('Message sent');
    } catch (error: any) {
      console.error('Error sending message:', error);
      toast.error(
        error?.data?.message || 'Failed to send message'
      );
    }
  };

  const conversations = conversationsData?.data || [];

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="flex items-center justify-between p-4 md:p-6 bg-white border-b border-gray-200">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
          <p className="text-sm text-gray-600 mt-1">
            {userRole === 'employer'
              ? 'Communicate with approved students'
              : 'Communicate with job employers'}
          </p>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex gap-0 md:gap-4 p-0 md:p-4 overflow-hidden">
        {/* Desktop: Side by side */}
        <div className="hidden md:flex gap-4 w-full">
          {/* Left Panel - Conversations */}
          <div className="w-80 bg-white rounded-lg shadow-sm overflow-hidden flex flex-col">
            <ConversationList
              conversations={conversations}
              selectedConversation={selectedConversation}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              onSelectConversation={setSelectedConversation}
              loading={conversationsLoading}
            />
          </div>

          {/* Right Panel - Chat */}
          <div className="flex-1 bg-white rounded-lg shadow-sm overflow-hidden flex flex-col">
            <ChatWindow
              conversation={selectedConversation}
              messages={messages}
              loading={messagesLoading}
              onSendMessage={handleSendMessage}
              sendLoading={sendLoading}
            />
          </div>
        </div>

        {/* Mobile: Conditional display */}
        <div className="md:hidden w-full flex flex-col">
          {!selectedConversation ? (
            <div className="bg-white rounded-lg shadow-sm flex-1 flex flex-col">
              <ConversationList
                conversations={conversations}
                selectedConversation={selectedConversation}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                onSelectConversation={setSelectedConversation}
                loading={conversationsLoading}
              />
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm flex-1 flex flex-col">
              <ChatWindow
                conversation={selectedConversation}
                messages={messages}
                loading={messagesLoading}
                onSendMessage={handleSendMessage}
                sendLoading={sendLoading}
              />
              <div className="p-2 border-t border-gray-200">
                <button
                  onClick={() => setSelectedConversation(null)}
                  className="text-sm text-gray-600 hover:text-gray-900"
                >
                  ← Back to conversations
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Error states */}
      {conversationsError && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg m-4">
          <div className="font-semibold">Failed to load conversations</div>
          <div className="text-xs mt-2">
            {typeof conversationsError === 'object' && conversationsError !== null 
              ? JSON.stringify(conversationsError) 
              : String(conversationsError)}
          </div>
        </div>
      )}

      {messagesError && selectedConversation && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg m-4">
          <div className="font-semibold">Failed to load messages</div>
          <div className="text-xs mt-2">
            {typeof messagesError === 'object' && messagesError !== null 
              ? JSON.stringify(messagesError) 
              : String(messagesError)}
          </div>
        </div>
      )}
    </div>
  );
};

export default Messages;

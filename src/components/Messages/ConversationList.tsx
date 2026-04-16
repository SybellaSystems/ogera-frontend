import React, { useMemo } from 'react';
import type { IConversation } from '@/types/message.types';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

interface ConversationListProps {
  conversations: IConversation[];
  selectedConversation: IConversation | null;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onSelectConversation: (conversation: IConversation) => void;
  loading: boolean;
}

const ConversationList: React.FC<ConversationListProps> = ({
  conversations,
  selectedConversation,
  searchQuery,
  onSearchChange,
  onSelectConversation,
  loading,
}) => {
  const filteredConversations = useMemo(() => {
    if (!searchQuery.trim()) return conversations;

    const query = searchQuery.toLowerCase();
    return conversations.filter((conv) => {
      const otherUser = conv.employer?.full_name || conv.student?.full_name || '';
      const jobTitle = conv.job?.job_title || '';
      return (
        otherUser.toLowerCase().includes(query) ||
        jobTitle.toLowerCase().includes(query)
      );
    });
  }, [conversations, searchQuery]);

  const formatTimestamp = (date: string | undefined): string => {
    if (!date) return '';
    try {
      const d = new Date(date);
      const now = new Date();
      const diffMs = now.getTime() - d.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);

      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays < 7) return `${diffDays}d ago`;
      
      // Format as MMM d (e.g., "Jan 15")
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return `${monthNames[d.getMonth()]} ${d.getDate()}`;
    } catch {
      return '';
    }
  };

  return (
    <div className="flex flex-col h-full bg-white border-r border-gray-200">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Messages</h2>

        {/* Search Input */}
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto">
        {loading && (
          <div className="p-4 space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="p-3 rounded-lg bg-gray-100 animate-pulse">
                <div className="h-4 bg-gray-300 rounded w-3/4 mb-2" />
                <div className="h-3 bg-gray-300 rounded w-1/2" />
              </div>
            ))}
          </div>
        )}

        {!loading && filteredConversations.length === 0 && (
          <div className="p-4 text-center text-gray-500">
            {searchQuery ? 'No conversations found' : 'No conversations yet'}
          </div>
        )}

        {!loading &&
          filteredConversations.map((conversation) => (
            <button
              key={conversation.conversation_id}
              onClick={() => onSelectConversation(conversation)}
              className={`w-full p-4 border-b border-gray-100 text-left transition-colors hover:bg-gray-50 ${
                selectedConversation?.conversation_id ===
                conversation.conversation_id
                  ? 'bg-purple-50 border-l-4 border-l-purple-600'
                  : ''
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 truncate">
                    {conversation.employer?.full_name ||
                      conversation.student?.full_name ||
                      'Unknown'}
                  </h3>
                  <p className="text-sm text-gray-600 truncate">
                    {conversation.job?.job_title || 'No job'}
                  </p>
                  <p className="text-xs text-gray-500 mt-1 line-clamp-1">
                    {conversation.lastMessage?.content || 'No messages yet'}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className="text-xs text-gray-500 whitespace-nowrap">
                    {formatTimestamp(conversation.last_message_at)}
                  </span>
                  {conversation.unreadCount && conversation.unreadCount > 0 && (
                    <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-red-500 text-white text-xs font-bold">
                      {conversation.unreadCount > 99 ? '99+' : conversation.unreadCount}
                    </span>
                  )}
                </div>
              </div>
            </button>
          ))}
      </div>
    </div>
  );
};

export default ConversationList;

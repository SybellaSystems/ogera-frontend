import React, { useState, useEffect, useRef } from 'react';
import type { IConversation, IMessage } from '@/types/message.types';
import { PaperAirplaneIcon, PaperClipIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useSelector } from 'react-redux';

interface ChatWindowProps {
  conversation: IConversation | null;
  messages: IMessage[];
  loading: boolean;
  onSendMessage: (content: string, file?: File) => void;
  sendLoading?: boolean;
}

const ChatWindow: React.FC<ChatWindowProps> = ({
  conversation,
  messages,
  loading,
  onSendMessage,
  sendLoading = false,
}) => {
  const [messageContent, setMessageContent] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const currentUserId = useSelector((state: any) => state.auth.user?.user_id);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();

    if (!messageContent.trim() && !selectedFile) return;

    onSendMessage(messageContent, selectedFile || undefined);
    setMessageContent('');
    setSelectedFile(null);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const isImageFile = (mimeType?: string | null) => mimeType?.startsWith('image/');
  const isPdfFile = (mimeType?: string | null) => mimeType === 'application/pdf';

  const formatTime = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      return `${hours}:${minutes}`;
    } catch {
      return '';
    }
  };

  if (!conversation) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-gray-50">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Select a conversation
          </h3>
          <p className="text-gray-600">
            Choose a conversation from the list to start messaging
          </p>
        </div>
      </div>
    );
  }

  const otherUser =
    currentUserId === conversation.employer_id
      ? conversation.student
      : conversation.employer;

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
        <div>
          <h2 className="font-bold text-gray-900">
            {otherUser?.full_name || 'Unknown'}
          </h2>
          <p className="text-sm text-gray-600">
            {conversation.job?.job_title}
          </p>
        </div>
        {otherUser?.profile_image_url && (
          <img
            src={otherUser.profile_image_url}
            alt={otherUser.full_name}
            className="h-10 w-10 rounded-full object-cover"
          />
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-gray-50 to-white">
        {loading && (
          <div className="flex justify-center items-center h-full">
            <div className="text-gray-500">Loading messages...</div>
          </div>
        )}

        {!loading && messages.length === 0 && (
          <div className="flex justify-center items-center h-full">
            <div className="text-center text-gray-500">
              <p className="text-sm">No messages yet</p>
              <p className="text-xs mt-1">Start the conversation!</p>
            </div>
          </div>
        )}

        {!loading &&
          messages.map((message, index) => {
            const isCurrentUser = message.sender_id === currentUserId;
            const showAvatar =
              index === messages.length - 1 ||
              messages[index + 1]?.sender_id !== message.sender_id;

            return (
              <div
                key={message.message_id}
                className={`flex ${
                  isCurrentUser ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`flex gap-2 max-w-xs ${
                    isCurrentUser ? 'flex-row-reverse' : 'flex-row'
                  }`}
                >
                  {showAvatar && (
                    <div className="flex-shrink-0">
                      {message.sender?.profile_image_url ? (
                        <img
                          src={message.sender.profile_image_url}
                          alt={message.sender.full_name}
                          className="h-8 w-8 rounded-full object-cover"
                        />
                      ) : (
                        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
                          {message.sender?.full_name?.[0]?.toUpperCase()}
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex flex-col gap-1">
                    {/* File attachment if exists */}
                    {message.file_url && (
                      <div className={`px-4 py-2 rounded-lg ${
                        isCurrentUser
                          ? 'bg-purple-600 text-white rounded-br-none'
                          : 'bg-gray-100 text-gray-900 rounded-bl-none'
                      }`}>
                        {isImageFile(message.file_type) ? (
                          <img
                            src={message.file_url}
                            alt="message attachment"
                            className="max-w-xs rounded"
                          />
                        ) : (
                          <div className="flex items-center gap-2">
                            <div className="flex-1">
                              <p className="text-xs font-semibold truncate">{message.file_name}</p>
                              {isPdfFile(message.file_type) && (
                                <p className="text-xs opacity-75">PDF Document</p>
                              )}
                            </div>
                            <a
                              href={message.file_url}
                              download={message.file_name}
                              className={`px-2 py-1 rounded text-xs font-semibold ${
                                isCurrentUser
                                  ? 'bg-purple-700 hover:bg-purple-800'
                                  : 'bg-gray-200 text-gray-900 hover:bg-gray-300'
                              }`}
                            >
                              ⬇️
                            </a>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Message text */}
                    {message.content && (
                      <div
                        className={`px-4 py-2 rounded-lg break-words ${
                          isCurrentUser
                            ? 'bg-purple-600 text-white rounded-br-none'
                            : 'bg-gray-100 text-gray-900 rounded-bl-none'
                        }`}
                      >
                        <p className="text-sm">{message.content}</p>
                      </div>
                    )}

                    <span
                      className={`text-xs ${
                        isCurrentUser
                          ? 'text-gray-500 text-right'
                          : 'text-gray-500 text-left'
                      }`}
                    >
                      {formatTime(message.created_at)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <form
        onSubmit={handleSendMessage}
        className="p-4 border-t border-gray-200 bg-white"
      >
        {/* File preview */}
        {selectedFile && (
          <div className="mb-3 p-2 bg-gray-50 rounded-lg flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">{selectedFile.name}</p>
              <p className="text-xs text-gray-500">
                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
            <button
              type="button"
              onClick={removeFile}
              className="p-1 hover:bg-gray-200 rounded transition-colors"
            >
              <XMarkIcon className="h-4 w-4 text-gray-600" />
            </button>
          </div>
        )}

        <div className="flex gap-2">
          <input
            type="text"
            value={messageContent}
            onChange={(e) => setMessageContent(e.target.value)}
            placeholder="Type a message..."
            disabled={sendLoading}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:bg-gray-50 disabled:cursor-not-allowed"
          />

          {/* File picker button */}
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
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg disabled:cursor-not-allowed transition-colors"
            title="Attach file"
          >
            <PaperClipIcon className="h-5 w-5" />
          </button>

          {/* Send button */}
          <button
            type="submit"
            disabled={sendLoading || (!messageContent.trim() && !selectedFile)}
            className="p-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            <PaperAirplaneIcon className="h-5 w-5" />
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatWindow;

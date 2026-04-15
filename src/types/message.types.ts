export interface IConversation {
  conversation_id: string;
  job_id: string;
  employer_id: string;
  student_id: string;
  created_at: string;
  updated_at: string;
  last_message_at?: string;
  employer?: IConversationUser;
  student?: IConversationUser;
  job?: IConversationJob;
  lastMessage?: IMessage;
  unreadCount?: number;
}

export interface IConversationUser {
  user_id: string;
  full_name: string;
  profile_image_url?: string;
}

export interface IConversationJob {
  job_id: string;
  job_title: string;
}

export interface IMessage {
  message_id: string;
  conversation_id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  read_status: boolean;
  file_url?: string | null;
  file_name?: string | null;
  file_type?: string | null;
  created_at: string;
  updated_at: string;
  sender?: IConversationUser;
}

export interface ICreateConversationRequest {
  employer_id: string;
  student_id: string;
  job_id: string;
}

export interface ISendMessageRequest {
  content: string;
}

export interface IConversationListItemProps {
  conversation: IConversation;
  isSelected: boolean;
  onSelect: (conversation: IConversation) => void;
}

export interface IChatWindowProps {
  conversation: IConversation;
  messages: IMessage[];
  loading: boolean;
  onSendMessage: (content: string) => void;
}

export interface IMessagesPageState {
  conversations: IConversation[];
  selectedConversation: IConversation | null;
  messages: IMessage[];
  loading: boolean;
  error: string | null;
  searchQuery: string;
}

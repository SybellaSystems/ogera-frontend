import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

const getSocketBaseUrl = () =>
  import.meta.env.VITE_API_URL?.replace('/api', '') || 'https://api.ogera.sybellasystems.co.rw';

export const initializeSocket = (getToken: () => string | null): Socket => {
  const token = getToken();
  const existingAuthToken = (socket as any)?.auth?.token;

  if (socket && socket.connected) {
    if (existingAuthToken === token) {
      return socket;
    }

    socket.disconnect();
    socket = null;
  }

  if (!token) {
    throw new Error('No authentication token available');
  }

  socket = io(getSocketBaseUrl(), {
    auth: {
      token,
    },
    transports: ['websocket', 'polling'],
  });

  return socket;
};

export const getSocket = (getToken: () => string | null): Socket | null => {
  try {
    return initializeSocket(getToken);
  } catch (error) {
    console.error('Failed to initialize socket:', error);
    return null;
  }
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const joinConversationRoom = (
  conversation_id: string,
  getToken: () => string | null
) => {
  const activeSocket = getSocket(getToken);
  activeSocket?.emit('join_conversation', conversation_id);
};

export const leaveConversationRoom = (
  conversation_id: string,
  getToken: () => string | null
) => {
  const activeSocket = getSocket(getToken);
  activeSocket?.emit('leave_conversation', conversation_id);
};

export const emitTypingStart = (
  conversation_id: string,
  getToken: () => string | null
) => {
  const activeSocket = getSocket(getToken);
  activeSocket?.emit('typing:start', { conversation_id });
};

export const emitTypingStop = (
  conversation_id: string,
  getToken: () => string | null
) => {
  const activeSocket = getSocket(getToken);
  activeSocket?.emit('typing:stop', { conversation_id });
};

export const joinDisputeRoom = (dispute_id: string, getToken: () => string | null) => {
  const activeSocket = getSocket(getToken);
  activeSocket?.emit('join_dispute', dispute_id);
};

export const leaveDisputeRoom = (dispute_id: string, getToken: () => string | null) => {
  const activeSocket = getSocket(getToken);
  activeSocket?.emit('leave_dispute', dispute_id);
};

import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export const initializeSocket = (getToken: () => string | null): Socket => {
    if (socket?.connected) {
        return socket;
    }

    const token = getToken();
    if (!token) {
        throw new Error('No authentication token available');
    }
    
    socket = io(import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000', {
        auth: {
            token: token,
        },
        transports: ['websocket', 'polling'],
    });

    socket.on('connect', () => {
        console.log('Socket.IO connected');
    });

    socket.on('disconnect', () => {
        console.log('Socket.IO disconnected');
    });

    socket.on('error', (error: any) => {
        console.error('Socket.IO error:', error);
    });

    return socket;
};

export const getSocket = (getToken: () => string | null): Socket | null => {
    if (!socket || !socket.connected) {
        try {
            return initializeSocket(getToken);
        } catch (error) {
            console.error('Failed to initialize socket:', error);
            return null;
        }
    }
    return socket;
};

export const disconnectSocket = () => {
    if (socket) {
        socket.disconnect();
        socket = null;
    }
};

// Helper to join a dispute room
export const joinDisputeRoom = (dispute_id: string, getToken: () => string | null) => {
    const sock = getSocket(getToken);
    if (sock) {
        sock.emit('join_dispute', dispute_id);
    }
};

// Helper to leave a dispute room
export const leaveDisputeRoom = (dispute_id: string, getToken: () => string | null) => {
    const sock = getSocket(getToken);
    if (sock) {
        sock.emit('leave_dispute', dispute_id);
    }
};


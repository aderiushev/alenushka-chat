import io from 'socket.io-client';
import { create } from 'zustand';

interface SocketState {
  socket: ReturnType<typeof io> | null;
  messages: Message[];
  connect: (roomId: string) => void;
  sendMessage: (message: Omit<Message, 'id' | 'createdAt'>) => void;
}

export const useSocketStore = create<SocketState>((set, get) => ({
  socket: null,
  messages: [],
  connect: (roomId: string) => {
    const existingSocket = get().socket;
    const token = localStorage.getItem('token');

    if (existingSocket) {
      existingSocket.off();
      existingSocket.disconnect();
    }

    const socket = io(process.env.NODE_ENV === 'development' ? 'http://localhost:4001' : `${window.location.origin}`, {
      extraHeaders: {
        Authorization: token ? `Bearer ${token}` : '',
      },
      path: '/api/socket.io',
      transports: ['websocket'],
      query: {
        token,
      },
    });

    socket.on('initial-messages', (initialMessages: Message[]) => {
      set({ messages: initialMessages });
    });

    socket.on('new-message', (payload: { message: Message, clientId: string }) => {
      set((state) => ({
        messages: [...state.messages, payload.message],
      }));
    });

    socket.emit('join-room', roomId);
    set({ socket });
  },
  sendMessage: (msg) => {
    get().socket?.emit('send-message', msg);
  },
}));

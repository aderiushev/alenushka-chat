import io from 'socket.io-client';
import { create } from 'zustand';

interface SocketState {
  socket: ReturnType<typeof io> | null;
  messages: Message[];
  connect: (roomId: string) => void;
  sendMessage: (message: Omit<Message, 'id' | 'createdAt'>) => void;
  editMessage: (message: Omit<Message, 'createdAt'>) => void;
  deleteMessage: (message: Message) => void;
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

    const socket = io(process.env.NODE_ENV === 'development' ? 'localhost:4001' : `${window.location.protocol}//${window.location.hostname}`, {
      query: {
        token,
      },
      path: '/api/socket.io',
      transports: ['websocket'],
    });

    socket.on('initial-messages', (initialMessages: Message[]) => {
      set({ messages: initialMessages });
    });

    socket.on('new-message', (payload: { message: Message, clientId: string }) => {
      set((state) => ({
        messages: [...state.messages, payload.message],
      }));
    });

    socket.on('edited-message', (payload: { message: Message, clientId: string }) => {
      set((state) => ({
        messages: state.messages.map((item) => item.id === payload.message.id ? payload.message : item)
      }));
    });

    socket.on('deleted-message', (payload: { id: string, clientId: string }) => {
      set((state) => ({
        messages: state.messages.filter((item) => item.id !== payload.id),
      }));
    });

    socket.emit('join-room', roomId);
    set({ socket });
  },
  sendMessage: (msg) => {
    get().socket?.emit('send-message', msg);
  },
  editMessage: (msg) => {
    get().socket?.emit('edit-message', msg);
  },
  deleteMessage: (id) => {
    get().socket?.emit('delete-message', id);
  },
}));

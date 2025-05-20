import io from 'socket.io-client';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface PendingMessage {
  id: string;
  message: Omit<Message, 'id' | 'createdAt'>;
  type: 'new' | 'edit' | 'delete';
  timestamp: number;
}

interface SocketState {
  socket: ReturnType<typeof io> | null;
  messages: Message[];
  pendingMessages: PendingMessage[];
  isConnected: boolean;
  connect: (roomId: string) => void;
  sendMessage: (message: Omit<Message, 'id' | 'createdAt'>) => void;
  editMessage: (message: Omit<Message, 'createdAt'>) => void;
  deleteMessage: (message: Message) => void;
  removePendingMessage: (id: string) => void;
  processPendingMessages: () => void;
}

export const useSocketStore = create<SocketState>()(
  persist(
    (set, get) => ({
      socket: null,
      messages: [],
      pendingMessages: [],
      isConnected: false,
      connect: (roomId: string) => {
        const existingSocket = get().socket;
        const token = localStorage.getItem('token');

        if (existingSocket) {
          console.log('Disconnecting existing socket');
          existingSocket.off();
          existingSocket.disconnect();
        }

        console.log(`Connecting to room: ${roomId}`);
        const socket = io(process.env.NODE_ENV === 'development' ? 'localhost:4001' : `${window.location.protocol}//${window.location.hostname}`, {
          query: {
            token,
          },
          path: '/api/socket.io',
          transports: ['websocket'],
          reconnection: true,
          reconnectionAttempts: 5,
          reconnectionDelay: 1000,
          reconnectionDelayMax: 5000,
          timeout: 20000,
        });

        socket.on('connect', () => {
          console.log('Socket connected');
          set({ isConnected: true });
          socket.emit('join-room', roomId);
          // Process any pending messages
          get().processPendingMessages();
        });

        socket.on('disconnect', (reason) => {
          console.log(`Socket disconnected: ${reason}`);
          set({ isConnected: false });
        });

        socket.on('connect_error', (error) => {
          console.error('Connection error:', error);
          set({ isConnected: false });
        });

        socket.on('reconnect', (attemptNumber) => {
          console.log(`Socket reconnected after ${attemptNumber} attempts`);
          set({ isConnected: true });
          socket.emit('join-room', roomId);
        });

        socket.on('reconnect_attempt', (attemptNumber) => {
          console.log(`Reconnection attempt: ${attemptNumber}`);
        });

        socket.on('reconnect_error', (error) => {
          console.error('Reconnection error:', error);
        });

        socket.on('reconnect_failed', () => {
          console.error('Failed to reconnect');
        });

        socket.on('initial-messages', (initialMessages: Message[]) => {
          console.log('Received initial messages:', initialMessages.length);
          set({ messages: initialMessages });
        });

        socket.on('new-message', (payload: { message: Message, clientId: string }) => {
          console.log('Received new message:', payload.message.id);
          set((state) => {
            // Check if this is our own message that we already have in the UI
            const existingTempMessage = state.messages.find(m =>
              m.pending &&
              m.content === payload.message.content &&
              m.type === payload.message.type &&
              m.roomId === payload.message.roomId
            );

            if (existingTempMessage) {
              console.log('Replacing temporary message with server message');
              // Replace the temporary message with the real one
              return {
                messages: state.messages.map(m =>
                  m.id === existingTempMessage.id ? payload.message : m
                )
              };
            } else {
              // It's a new message from someone else
              return {
                messages: [...state.messages, payload.message],
              };
            }
          });
        });

        socket.on('edited-message', (payload: { message: Message, clientId: string }) => {
          console.log('Received edited message:', payload.message.id);
          set((state) => ({
            messages: state.messages.map((item) => item.id === payload.message.id ? payload.message : item)
          }));
        });

        socket.on('deleted-message', (payload: { id: string, clientId: string }) => {
          console.log('Received deleted message:', payload.id);
          set((state) => ({
            messages: state.messages.filter((item) => item.id !== payload.id),
          }));
        });

        set({ socket });
      },
      sendMessage: (msg) => {
        const socket = get().socket;
        const pendingId = `pending_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        // Add to pending messages
        const pendingMessage: PendingMessage = {
          id: pendingId,
          message: msg,
          type: 'new',
          timestamp: Date.now(),
        };

        // Add to UI with pending status
        const tempMessage: Message = {
          id: pendingId,
          ...msg,
          createdAt: new Date().toISOString(),
          pending: true,
        };

        set((state) => ({
          pendingMessages: [...state.pendingMessages, pendingMessage],
          messages: [...state.messages, tempMessage],
        }));

        if (socket && get().isConnected) {
          console.log('Sending message:', msg);
          socket.emit('send-message', msg, (response: any) => {
            if (response && response.success) {
              console.log('Message sent successfully:', response.message.id);
              // Remove from pending
              get().removePendingMessage(pendingId);

              // Update the temporary message with the real one
              // We don't need to add the message again as it will come through the 'new-message' event
              set((state) => ({
                messages: state.messages.map(m =>
                  m.id === pendingId ? { ...response.message, pending: false } : m
                )
              }));
            } else {
              console.error('Failed to send message:', response?.error || 'Unknown error');
              // Keep the message in pending state for retry
            }
          });
        } else {
          console.log('Socket not connected, message queued:', pendingId);
        }
      },
      editMessage: (msg) => {
        const socket = get().socket;
        const pendingId = `pending_edit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        // Add to pending messages
        const pendingMessage: PendingMessage = {
          id: pendingId,
          message: msg,
          type: 'edit',
          timestamp: Date.now(),
        };

        // Update UI with pending status
        set((state) => ({
          pendingMessages: [...state.pendingMessages, pendingMessage],
          messages: state.messages.map(m =>
            m.id === msg.id ? { ...m, ...msg, pending: true } : m
          )
        }));

        if (socket && get().isConnected) {
          console.log('Editing message:', msg.id);
          socket.emit('edit-message', msg, (response: any) => {
            if (response && response.success) {
              console.log('Message edited successfully:', response.message.id);
              get().removePendingMessage(pendingId);

              // Update with the confirmed message from server
              set((state) => ({
                messages: state.messages.map(m =>
                  m.id === msg.id ? { ...response.message, pending: false } : m
                )
              }));
            } else {
              console.error('Failed to edit message:', response?.error || 'Unknown error');
              // Keep in pending state for retry
            }
          });
        } else {
          console.log('Socket not connected, edit queued:', pendingId);
        }
      },
      deleteMessage: (msg) => {
        const socket = get().socket;
        const pendingId = `pending_delete_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        // Add to pending messages
        const pendingMessage: PendingMessage = {
          id: pendingId,
          message: msg,
          type: 'delete',
          timestamp: Date.now(),
        };

        // Update UI with pending status
        set((state) => ({
          pendingMessages: [...state.pendingMessages, pendingMessage],
          messages: state.messages.map(m =>
            m.id === msg.id ? { ...m, pending: true, pendingDelete: true } : m
          )
        }));

        if (socket && get().isConnected) {
          console.log('Deleting message:', msg.id);
          socket.emit('delete-message', msg, (response: any) => {
            if (response && response.success) {
              console.log('Message deleted successfully:', msg.id);
              get().removePendingMessage(pendingId);

              // Remove from UI
              set((state) => ({
                messages: state.messages.filter(m => m.id !== msg.id)
              }));
            } else {
              console.error('Failed to delete message:', response?.error || 'Unknown error');
              // Keep in pending state for retry
            }
          });
        } else {
          console.log('Socket not connected, delete queued:', pendingId);
        }
      },
      removePendingMessage: (id: string) => {
        set((state) => ({
          pendingMessages: state.pendingMessages.filter(pm => pm.id !== id)
        }));
      },
      processPendingMessages: () => {
        const { pendingMessages, socket, isConnected } = get();

        if (!socket || !isConnected || pendingMessages.length === 0) {
          return;
        }

        console.log(`Processing ${pendingMessages.length} pending messages`);

        // Sort by timestamp to process in order
        const sortedPending = [...pendingMessages].sort((a, b) => a.timestamp - b.timestamp);

        sortedPending.forEach(pending => {
          console.log(`Processing pending ${pending.type} message:`, pending.id);

          switch (pending.type) {
            case 'new':
              socket.emit('send-message', pending.message, (response: any) => {
                if (response && response.success) {
                  console.log('Pending message sent successfully:', response.message.id);
                  get().removePendingMessage(pending.id);

                  // Update the temporary message with the real one
                  set((state) => ({
                    messages: state.messages.map(m =>
                      m.id === pending.id ? { ...response.message, pending: false } : m
                    )
                  }));
                } else {
                  console.error('Failed to process pending message:', response?.error || 'Unknown error');
                }
              });
              break;

            case 'edit':
              socket.emit('edit-message', pending.message, (response: any) => {
                if (response && response.success) {
                  console.log('Pending edit processed successfully:', response.message.id);
                  get().removePendingMessage(pending.id);

                  // Update with the confirmed message from server
                  set((state) => ({
                    messages: state.messages.map(m =>
                      m.id === pending.message.id ? { ...response.message, pending: false } : m
                    )
                  }));
                } else {
                  console.error('Failed to process pending edit:', response?.error || 'Unknown error');
                }
              });
              break;

            case 'delete':
              socket.emit('delete-message', pending.message, (response: any) => {
                if (response && response.success) {
                  console.log('Pending delete processed successfully:', pending.message.id);
                  get().removePendingMessage(pending.id);

                  // Remove from UI
                  set((state) => ({
                    messages: state.messages.filter(m => m.id !== pending.message.id)
                  }));
                } else {
                  console.error('Failed to process pending delete:', response?.error || 'Unknown error');
                }
              });
              break;
          }
        });
      }
    }),
    {
      name: 'socket-store',
      partialize: (state) => ({
        pendingMessages: state.pendingMessages,
        // Don't persist socket or messages
      }),
    }
  )
);

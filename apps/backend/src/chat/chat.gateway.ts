import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';
import { Prisma } from '@prisma/client';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { JwtService } from '../auth/jwt.service';

@WebSocketGateway({ cors: true, namespace: '/', path: '/api/socket.io' })
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;
  private userSockets: Map<string, Set<string>> = new Map(); // userId/socketId -> Set of socket IDs

  constructor(
      private readonly chatService: ChatService,
      private readonly jwtService: JwtService,
  ) {}

  getUserIdFromSocket(client: Socket): string | null {
    const token = client.handshake.query.token as string;

    if (token) {
      try {
        const decoded = this.jwtService.verify(token);

        return decoded.sub;
      } catch (err) {
        console.error('Error decoding token:', err);
        return null;
      }
    }
    return null;
  }

  handleConnection(client: Socket) {
    const userId = this.getUserIdFromSocket(client);
    const identifier = userId || client.id; // Use userId for doctors, socket.id for clients

    // Add this socket to the user's socket set
    if (!this.userSockets.has(identifier)) {
      this.userSockets.set(identifier, new Set());
    }
    const socketSet = this.userSockets.get(identifier)!;
    const isFirstConnection = socketSet.size === 0;
    socketSet.add(client.id);

    // Get all currently online user identifiers
    const onlineUsers = Array.from(this.userSockets.keys());

    // Only emit user-online if this is the user's FIRST connection
    if (isFirstConnection) {
      this.server.emit('user-online', { clientId: client.id, userId: identifier });
    }

    // Always emit updated online users list
    this.server.emit('online-users', onlineUsers);

    console.log(`User ${identifier} connected (${socketSet.size} active socket(s))`);
  }

  handleDisconnect(client: Socket) {
    const userId = this.getUserIdFromSocket(client);
    const identifier = userId || client.id;

    // Remove this socket from the user's socket set
    if (this.userSockets.has(identifier)) {
      const socketSet = this.userSockets.get(identifier)!;
      socketSet.delete(client.id);

      // Only mark user offline if they have NO more active sockets
      if (socketSet.size === 0) {
        this.userSockets.delete(identifier);
        this.server.emit('user-offline', { clientId: client.id, userId: identifier });
      }

      console.log(`User ${identifier} disconnected (${socketSet.size} remaining socket(s))`);
    }

    // Always emit updated online users list
    const onlineUsers = Array.from(this.userSockets.keys());
    this.server.emit('online-users', onlineUsers);
  }

  @SubscribeMessage('typing')
  handleTyping(
      @MessageBody() roomId: string,
      @ConnectedSocket() client: Socket
  ) {
    client.to(roomId).emit('typing', client.id);
  }

  @SubscribeMessage('join-room')
  async handleJoinRoom(@MessageBody() roomId: string, @ConnectedSocket() client: Socket) {
    client.join(roomId);
    const messages = await this.chatService.getMessagesForRoom(roomId);
    client.emit('initial-messages', messages);
  }

  @SubscribeMessage('send-message')
  async handleSendMessage(
    @MessageBody() dto: Prisma.MessageUncheckedCreateInput,
    @ConnectedSocket() client: Socket,
  ) {
    try {
      console.log('Received send-message:', dto.roomId);
      const message = await this.chatService.createMessage(dto);
      this.server.to(message.roomId).emit('new-message', { message, clientId: client.id });
      return { success: true, message };
    } catch (error) {
      console.error('Error sending message:', error);
      return { success: false, error: error.message };
    }
  }

  @SubscribeMessage('edit-message')
  async handleEditMessage(
    @MessageBody() dto: Prisma.MessageUncheckedCreateInput,
    @ConnectedSocket() client: Socket,
  ) {
    try {
      console.log('Received edit-message:', dto.id);
      const userId = this.getUserIdFromSocket(client);
      const message = await this.chatService.getMessageById(dto.id);

      if (!message) {
        return { success: false, error: 'Message not found' };
      }

      // Check if user is authorized to edit this message
      // Allow if: message is from a guest AND current user is a guest (userId is null)
      // Allow if: message is from a doctor AND current user is that same doctor
      const isGuestMessage = !message.doctorId;
      const isGuestUser = userId === null;
      const isDoctorMessage = message.doctor && message.doctorId;
      const isDoctorOwner = userId !== null && message.doctor && Number(userId) === message.doctor.userId;

      const isAuthorized = (isGuestMessage && isGuestUser) || (isDoctorMessage && isDoctorOwner);

      if (!isAuthorized) {
        return { success: false, error: 'Unauthorized' };
      }

      const editedMessage = await this.chatService.editMessage(dto);
      this.server.to(editedMessage.roomId).emit('edited-message', { message: editedMessage, clientId: client.id });
      return { success: true, message: editedMessage };
    } catch (error) {
      console.error('Error editing message:', error);
      return { success: false, error: error.message };
    }
  }

  @SubscribeMessage('delete-message')
  async handleDeleteMessage(
    @MessageBody() dto: Prisma.MessageUncheckedCreateInput,
    @ConnectedSocket() client: Socket,
  ) {
    try {
      console.log('Received delete-message:', dto.id);
      const userId = this.getUserIdFromSocket(client);
      const message = await this.chatService.getMessageById(dto.id);

      if (!message) {
        return { success: false, error: 'Message not found' };
      }

      // Check if user is authorized to delete this message
      // Allow if: message is from a guest AND current user is a guest (userId is null)
      // Allow if: message is from a doctor AND current user is that same doctor
      const isGuestMessage = !message.doctorId;
      const isGuestUser = userId === null;
      const isDoctorMessage = message.doctor && message.doctorId;
      const isDoctorOwner = userId !== null && message.doctor && Number(userId) === message.doctor.userId;

      const isAuthorized = (isGuestMessage && isGuestUser) || (isDoctorMessage && isDoctorOwner);

      if (!isAuthorized) {
        return { success: false, error: 'Unauthorized' };
      }

      await this.chatService.deleteMessage(dto);
      this.server.to(dto.roomId).emit('deleted-message', { id: dto.id, clientId: client.id });
      return { success: true };
    } catch (error) {
      console.error('Error deleting message:', error);
      return { success: false, error: error.message };
    }
  }
}

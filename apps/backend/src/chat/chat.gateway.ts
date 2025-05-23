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
  onlineUsers: Set<string> = new Set();

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

    this.onlineUsers.add(userId || client.id);
    this.server.emit('user-online', { clientId: client.id, userId });
    this.server.emit('online-users', Array.from(this.onlineUsers));
  }

  handleDisconnect(client: Socket) {
    const userId = this.getUserIdFromSocket(client);

    this.onlineUsers.delete(userId || client.id);
    this.server.emit('user-offline', { clientId: client.id, userId });
    this.server.emit('online-users', Array.from(this.onlineUsers));
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

      if (Number(userId) !== message.doctor.userId) {
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

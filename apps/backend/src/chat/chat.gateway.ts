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
    const token = client.handshake.headers.authorization?.split(' ')[1];

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
    const message = await this.chatService.createMessage(dto);
    this.server.to(dto.roomId).emit('new-message', { message, clientId: client.id });
  }
}

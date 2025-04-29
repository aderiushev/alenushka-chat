"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const chat_service_1 = require("./chat.service");
const client_1 = require("@prisma/client");
const jwt_service_1 = require("../auth/jwt.service");
let ChatGateway = class ChatGateway {
    constructor(chatService, jwtService) {
        this.chatService = chatService;
        this.jwtService = jwtService;
        this.onlineUsers = new Set();
    }
    getUserIdFromSocket(client) {
        const token = client.handshake.query.token;
        if (token) {
            try {
                const decoded = this.jwtService.verify(token);
                return decoded.sub;
            }
            catch (err) {
                console.error('Error decoding token:', err);
                return null;
            }
        }
        return null;
    }
    handleConnection(client) {
        const userId = this.getUserIdFromSocket(client);
        this.onlineUsers.add(userId || client.id);
        this.server.emit('user-online', { clientId: client.id, userId });
        this.server.emit('online-users', Array.from(this.onlineUsers));
    }
    handleDisconnect(client) {
        const userId = this.getUserIdFromSocket(client);
        this.onlineUsers.delete(userId || client.id);
        this.server.emit('user-offline', { clientId: client.id, userId });
        this.server.emit('online-users', Array.from(this.onlineUsers));
    }
    handleTyping(roomId, client) {
        client.to(roomId).emit('typing', client.id);
    }
    async handleJoinRoom(roomId, client) {
        client.join(roomId);
        const messages = await this.chatService.getMessagesForRoom(roomId);
        client.emit('initial-messages', messages);
    }
    async handleSendMessage(dto, client) {
        const message = await this.chatService.createMessage(dto);
        this.server.to(message.roomId).emit('new-message', { message, clientId: client.id });
    }
    async handleEditMessage(dto, client) {
        const message = await this.chatService.editMessage(dto);
        this.server.to(message.roomId).emit('edited-message', { message, clientId: client.id });
    }
    async handleDeleteMessage(dto, client) {
        await this.chatService.deleteMessage(dto);
        this.server.to(dto.roomId).emit('deleted-message', { id: dto.id, clientId: client.id });
    }
};
exports.ChatGateway = ChatGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], ChatGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)('typing'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, socket_io_1.Socket]),
    __metadata("design:returntype", void 0)
], ChatGateway.prototype, "handleTyping", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('join-room'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, socket_io_1.Socket]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "handleJoinRoom", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('send-message'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, socket_io_1.Socket]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "handleSendMessage", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('edit-message'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, socket_io_1.Socket]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "handleEditMessage", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('delete-message'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, socket_io_1.Socket]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "handleDeleteMessage", null);
exports.ChatGateway = ChatGateway = __decorate([
    (0, websockets_1.WebSocketGateway)({ cors: true, namespace: '/', path: '/api/socket.io' }),
    __metadata("design:paramtypes", [chat_service_1.ChatService,
        jwt_service_1.JwtService])
], ChatGateway);

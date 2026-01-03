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
        this.userSockets = new Map(); // userId/socketId -> Set of socket IDs
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
        const identifier = userId || client.id; // Use userId for doctors, socket.id for clients
        // Add this socket to the user's socket set
        if (!this.userSockets.has(identifier)) {
            this.userSockets.set(identifier, new Set());
        }
        const socketSet = this.userSockets.get(identifier);
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
    handleDisconnect(client) {
        const userId = this.getUserIdFromSocket(client);
        const identifier = userId || client.id;
        // Remove this socket from the user's socket set
        if (this.userSockets.has(identifier)) {
            const socketSet = this.userSockets.get(identifier);
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
    handleTyping(roomId, client) {
        client.to(roomId).emit('typing', client.id);
    }
    async handleJoinRoom(roomId, client) {
        client.join(roomId);
        const messages = await this.chatService.getMessagesForRoom(roomId);
        client.emit('initial-messages', messages);
        // Send current online users to the newly joined client
        // This ensures the client receives the list after their event listeners are set up
        const onlineUsers = Array.from(this.userSockets.keys());
        client.emit('online-users', onlineUsers);
    }
    async handleSendMessage(dto, client) {
        try {
            console.log('Received send-message:', dto.roomId);
            const message = await this.chatService.createMessage(dto);
            this.server.to(message.roomId).emit('new-message', { message, clientId: client.id });
            return { success: true, message };
        }
        catch (error) {
            console.error('Error sending message:', error);
            return { success: false, error: error.message };
        }
    }
    async handleEditMessage(dto, client) {
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
        }
        catch (error) {
            console.error('Error editing message:', error);
            return { success: false, error: error.message };
        }
    }
    async handleDeleteMessage(dto, client) {
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
        }
        catch (error) {
            console.error('Error deleting message:', error);
            return { success: false, error: error.message };
        }
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

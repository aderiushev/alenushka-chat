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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let ChatService = class ChatService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createMessage(data) {
        const message = await this.prisma.message.create({
            data
        });
        return this.prisma.message.findFirst({
            where: {
                id: message.id
            },
            include: {
                doctor: true,
            }
        });
    }
    async editMessage(data) {
        const message = await this.prisma.message.update({
            data,
            where: {
                id: data.id,
            }
        });
        return this.prisma.message.findFirst({
            where: {
                id: message.id
            },
            include: {
                doctor: true,
            }
        });
    }
    async deleteMessage(data) {
        await this.prisma.message.delete({
            where: {
                id: data.id,
            }
        });
        return data.id;
    }
    async getMessagesForRoom(roomId) {
        return this.prisma.message.findMany({
            where: { roomId },
            orderBy: { createdAt: 'asc' },
            include: {
                doctor: true,
            },
        });
    }
};
exports.ChatService = ChatService;
exports.ChatService = ChatService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ChatService);

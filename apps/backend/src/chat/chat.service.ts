import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class ChatService {
  constructor(private prisma: PrismaService) {}

  async createMessage(dto: Prisma.MessageUncheckedCreateInput) {
    const message = await this.prisma.message.create({
      data: {
        ...dto,
      },
    });

    return this.prisma.message.findFirst({
      where: {
        id: message.id
      },
      include: {
        user: true,
      }
    });
  }

  async getMessagesForRoom(roomId: string) {
    return this.prisma.message.findMany({
      where: { roomId },
      orderBy: { createdAt: 'asc' },
      include: {
        user: true,
      },
    });
  }
}

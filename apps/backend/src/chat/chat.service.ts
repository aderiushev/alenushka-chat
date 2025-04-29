import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class ChatService {
  constructor(private prisma: PrismaService) {}

  async createMessage(data: Prisma.MessageUncheckedCreateInput) {
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

  async editMessage(data: Prisma.MessageUncheckedCreateInput) {
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

  async deleteMessage(data: Prisma.MessageUncheckedCreateInput) {
    await this.prisma.message.delete({
      where: {
        id: data.id,
      }
    });

    return data.id;
  }

  async getMessagesForRoom(roomId: string) {
    return this.prisma.message.findMany({
      where: { roomId },
      orderBy: { createdAt: 'asc' },
      include: {
        doctor: true,
      },
    });
  }
}

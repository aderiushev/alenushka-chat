import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import * as admin from 'firebase-admin';

@Injectable()
export class ChatService {
  constructor(private prisma: PrismaService) {}

  async createMessage(data: Prisma.MessageUncheckedCreateInput) {
    const message = await this.prisma.message.create({
      data
    });

    const room = await this.prisma.room.findUnique({
      where: { id: data.roomId },
      include: {
        doctor: {
          include: {
            user: true
          }
        }
      }
    });

    if (!message.doctorId && room?.doctor?.user?.fcmToken) {
      try {
        await admin.messaging().send({
          token: room.doctor.user.fcmToken,
          notification: {
            title: 'Новое сообщение',
            body: `от ${room.patientName}`
          },
          data: {
            roomId: data.roomId,
            type: 'new_message'
          }
        });
      } catch (error) {
        console.error('Failed to send push notification:', error);
      }
    }


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
    await this.prisma.message.update({
      where: {
        id: data.id,
      },
      data: {
        status: 'deleted'
      }
    });

    return data.id;
  }

  async getMessagesForRoom(roomId: string) {
    return this.prisma.message.findMany({
      where: { roomId, status: 'active' },
      orderBy: { createdAt: 'asc' },
      include: {
        doctor: true,
      },
    });
  }

  async getMessageById(id: string) {
    return this.prisma.message.findUnique({
      where: { id },
      include: {
        doctor: true,
      },
    });
  }
}

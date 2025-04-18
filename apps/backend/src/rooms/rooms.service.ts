import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RoomsService {
  constructor(private prisma: PrismaService) {}

  create(patientName: string, doctorId: number) {
    return this.prisma.room.create({ data: { patientName, doctorId } });
  }

  findAll() {
    return this.prisma.room.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      include: { doctor: true, messages: { orderBy: { createdAt: 'desc' }, take: 1 } },
    });
  }

  async findAllByUserId(userId: number) {
    const doctor = await this.prisma.doctor.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!doctor) {
      throw new Error('Doctor not found for this user');
    }

    return this.prisma.room.findMany({
      where: {
        doctorId: doctor.id,
      },
      include: {
        doctor: true,
        messages: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  findById(id: string) {
    return this.prisma.room.findUnique({
      where: { id },
      include: {
        doctor: true,
      },
    });
  }

  async markRoomAsCompleted(id: string) {
    return this.prisma.room.update({
      where: { id },
      data: { status: 'completed' },
      include: {
        doctor: true,
      }
    });
  }
}

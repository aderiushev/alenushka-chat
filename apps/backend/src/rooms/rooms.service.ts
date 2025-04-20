import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RoomsService {
  constructor(private prisma: PrismaService) {}

  create(patientName: string, doctorId: number) {
    return this.prisma.room.create({ data: { patientName, doctorId } });
  }

  findAll(query?: string, status?: string, dateRange?: { start: string; end: string }) {
    return this.prisma.room.findMany({
      where: {
        AND: [
          status && status !== 'all'
              ? { status }
              : {},
          query
              ? {
                OR: [
                  { doctor: { name: { contains: query } } },
                  { messages: { some: { content: { contains: query } } } },
                  { patientName: { contains: query } },
                ]
              }
              : {},
          dateRange?.start && dateRange?.end
              ? {
                createdAt: {
                  gte: new Date(dateRange.start),
                  lte: new Date(dateRange.end),
                },
              }
              : {},
        ],
      },
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        doctor: true,
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });
  }

  async findAllByUserId(userId: number, query?: string, status?: string, dateRange?: { start: string; end: string }) {
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
        AND: [
          status && status !== 'all'
              ? { status }
              : {},

          query
              ? {
                OR: [
                  { patientName: { contains: query } },
                  { messages: { some: { content: { contains: query } } } },
                ],
              }
              : {},
          dateRange?.start && dateRange?.end
              ? {
                createdAt: {
                  gte: new Date(dateRange.start),
                  lte: new Date(dateRange.end),
                },
              }
              : {},
        ],
      },
      include: {
        doctor: true,
        // patient: true,
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
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

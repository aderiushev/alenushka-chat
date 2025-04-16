import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RoomsService {
  constructor(private prisma: PrismaService) {}

  create(patientName: string, userId: number) {
    return this.prisma.room.create({ data: { patientName, userId } });
  }

  findAll() {
    return this.prisma.room.findMany({
      include: { messages: { orderBy: { createdAt: 'desc' }, take: 1 } },
    });
  }

  findById(id: string) {
    return this.prisma.room.findUnique({
      where: { id },
      include: {
        user: true,
      },
    });
  }
}

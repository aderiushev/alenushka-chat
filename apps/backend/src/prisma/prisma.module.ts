import { Module } from '@nestjs/common';
import { PrismaService } from './prisma.service'; // Import PrismaService

@Module({
  providers: [PrismaService], // Provide PrismaService
  exports: [PrismaService],   // Export PrismaService so other modules can use it
})
export class PrismaModule {}

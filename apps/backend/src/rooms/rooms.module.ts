import { Module } from '@nestjs/common';
import { RoomsService } from './rooms.service';
import { RoomsController } from './rooms.controller';
import { AuthModule } from '../auth/auth.module';  // Import the module containing JwtService
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [AuthModule, PrismaModule],  // Add PrismaModule here
  controllers: [RoomsController],
  providers: [RoomsService],
})
export class RoomsModule {}

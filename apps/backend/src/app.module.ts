import { Module } from '@nestjs/common';
import { ChatGateway } from './chat/chat.gateway';
import { ChatService } from './chat/chat.service';
import { PrismaService } from './prisma/prisma.service';
import { RoomsModule } from './rooms/rooms.module';
import { UploadController } from './upload/upload.controller';
import { AuthModule } from "./auth/auth.module";
import './firebase';

@Module({
  imports: [AuthModule, RoomsModule],
  controllers: [UploadController],
  providers: [ChatGateway, ChatService, PrismaService],
})
export class AppModule {}

import { Module } from '@nestjs/common';
import * as path from 'path';
import { ConfigModule } from '@nestjs/config';
import { ChatGateway } from './chat/chat.gateway';
import { ChatService } from './chat/chat.service';
import { PrismaService } from './prisma/prisma.service';
import { RoomsModule } from './rooms/rooms.module';
import { UploadController } from './upload/upload.controller';
import { AuthModule } from "./auth/auth.module";
import { TelegramModule } from './telegram/telegram.module';
import './firebase';

@Module({
  imports: [AuthModule, RoomsModule, TelegramModule, ConfigModule.forRoot({
    isGlobal: true,
    envFilePath: path.resolve(__dirname, '..', '..', '.env'),
  })],
  controllers: [UploadController],
  providers: [ChatGateway, ChatService, PrismaService],
})
export class AppModule {}

import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from './jwt.service'; // your custom service
import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt.strategy';
import {AuthController} from "./auth.controller";

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '7d' },
    }),
  ],
  providers: [AuthService, JwtService, PrismaService, JwtStrategy],
  exports: [JwtService],
  controllers: [AuthController],
})
export class AuthModule {}

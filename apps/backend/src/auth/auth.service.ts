import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from './jwt.service';
import * as bcrypt from 'bcryptjs';
import {Prisma} from "@prisma/client";

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService, private jwtService: JwtService) {}

  async register(email: string, password: string) {
    const hashed = await bcrypt.hash(password, 10);
    const user = await this.prisma.user.create({ data: { email, password: hashed, role: 'doctor' } });
    return { token: this.jwtService.sign(user) };
  }

  async login(email: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedException();
    }
    return { token: this.jwtService.sign(user) };
  }

  async update(id: number, payload: Prisma.UserUncheckedUpdateInput) {
    const user = await this.prisma.user.update({
      where: { id },
      data: {
        fcmToken: payload.fcmToken
      }
    });

    return {
      user
    }
  }
}

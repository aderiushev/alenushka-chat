import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from './jwt.service';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService, private jwtService: JwtService) {}

  async register(name: string, email: string, password: string) {
    const hashed = await bcrypt.hash(password, 10);
    const user = await this.prisma.user.create({ data: { name, email, password: hashed, role: 'admin' } });
    return { token: this.jwtService.sign(user) };
  }

  async login(email: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedException();
    }
    return { token: this.jwtService.sign(user) };
  }
}

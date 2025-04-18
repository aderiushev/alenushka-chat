import { Injectable } from '@nestjs/common';
import { JwtService as NestJwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';

@Injectable()
export class JwtService {
  constructor(private jwtService: NestJwtService) {}

  sign(user: User) {
    const payload = { sub: user.id, role: user.role };
    return this.jwtService.sign(payload);
  }

  verify(token: string): { sub: string; role: string } {
    return this.jwtService.verify(token);
  }
}

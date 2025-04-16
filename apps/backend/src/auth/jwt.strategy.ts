import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private prisma: PrismaService) {
    const jwtSecret = process.env.JWT_SECRET;

    if (!jwtSecret) {
      throw new Error('JWT_SECRET is not defined in environment variables');
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: jwtSecret, // Ensure JWT_SECRET is defined
    });
  }

  async validate(payload: { sub: string }) {
    const user = await this.prisma.user.findUnique({ where: { id: Number(payload.sub) } });
    if (!user) {
      throw new UnauthorizedException();
    }
    return user;
  }
}

import { Body, Controller, Post, Get } from '@nestjs/common';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService, private prisma: PrismaService) {}

  @Post('register')
  async register(@Body() body: { email: string; password: string, name: string }) {
    return this.authService.register(body.name, body.email, body.password);
  }

  @Post('login')
  async login(@Body() body: { email: string; password: string }) {
    return this.authService.login(body.email, body.password);
  }

  // New GET endpoint to fetch the list of users
  @Get('users')
  async getUsers() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        name: true,
      },
    });
  }
}

import { Body, Controller, Post, Get, UseGuards, Req, Param } from '@nestjs/common';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import {Roles} from "./roles.decorator";
import {RolesGuard} from "./roles.guard";
import {JwtService} from "./jwt.service";

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService, private prisma: PrismaService, private jwtService: JwtService) {
  }

  @Post('register')
  async register(@Body() body: { email: string; password: string }) {
    return this.authService.register(body.email, body.password);
  }

  @Post('login')
  async login(@Body() body: { email: string; password: string }) {
    return this.authService.login(body.email, body.password);
  }

  @Roles('admin')
  @UseGuards(RolesGuard)
  @Get('doctors')
  async getDoctors() {
    return this.prisma.doctor.findMany({
      include: {
        user: true,
      },
    });
  }

  @Get('me')
  async me(@Req() req: Request) {
    const authHeader = req.headers['authorization'];
    const token = authHeader.split(' ')[1];

    const user = this.jwtService.verify(token);
    return this.prisma.user.findUnique({
      where: { id: Number(user.sub) },
      include: { doctor: true },
    });
  }

  @Get('doctors/:id')
  async getDoctorById(@Param('id') id: string) {
    return this.prisma.doctor.findUnique({
      where: { id: Number(id) },
      include: { user: true },
    });
  }
}


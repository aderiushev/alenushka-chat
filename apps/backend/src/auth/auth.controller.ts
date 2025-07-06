import { Body, Controller, Post, Get, UseGuards, Req, Param, UnauthorizedException, Patch, Put } from '@nestjs/common';
import { AuthService, DoctorRegistrationData } from './auth.service';
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

  /**
   * Register a new doctor (admin-only endpoint)
   * Creates both User and Doctor records in a transaction
   */
  @Roles('admin')
  @UseGuards(RolesGuard)
  @Post('register-doctor')
  async registerDoctor(@Body() body: DoctorRegistrationData) {
    return this.authService.registerDoctor(body);
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

  @Post('update-fcm-token')
  async updateFcmToken(
    @Req() req: Request,
    @Body() body: { fcmToken: string }
  ) {
    const authHeader = req.headers['authorization'];
    const token = authHeader.split(' ')[1];
    const user = this.jwtService.verify(token);

    return this.authService.update(Number(user.sub), { fcmToken: body.fcmToken });
  }

  /**
   * Toggle doctor status between active and disabled (admin-only endpoint)
   */
  @Roles('admin')
  @UseGuards(RolesGuard)
  @Patch('doctors/:id/status')
  async toggleDoctorStatus(@Param('id') id: string, @Body() body: { status: string }) {
    return this.authService.updateDoctorStatus(Number(id), body.status);
  }

  /**
   * Update doctor profile information (admin-only endpoint)
   */
  @Roles('admin')
  @UseGuards(RolesGuard)
  @Put('doctors/:id')
  async updateDoctor(@Param('id') id: string, @Body() body: {
    name: string;
    description: string;
    imageUrl: string;
    externalUrl: string;
    email: string;
  }) {
    return this.authService.updateDoctor(Number(id), body);
  }
}

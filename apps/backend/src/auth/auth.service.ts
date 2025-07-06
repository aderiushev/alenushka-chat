import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from './jwt.service';
import * as bcrypt from 'bcryptjs';
import {Prisma} from "@prisma/client";

/**
 * Interface for doctor registration data
 */
export interface DoctorRegistrationData {
  email: string;
  password: string;
  name: string;
  description: string;
  imageUrl: string;
  externalUrl: string;
}

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService, private jwtService: JwtService) {}

  async register(email: string, password: string) {
    const hashed = await bcrypt.hash(password, 10);
    const user = await this.prisma.user.create({ data: { email, password: hashed, role: 'doctor' } });
    return { token: this.jwtService.sign(user) };
  }

  /**
   * Register a new doctor with both User and Doctor records in a transaction
   * @param data - Doctor registration data including user and doctor fields
   * @returns Object containing user and doctor information (no token for admin registration)
   */
  async registerDoctor(data: DoctorRegistrationData) {
    const { email, password, name, description, imageUrl, externalUrl } = data;

    // Check if user with this email already exists
    const existingUser = await this.prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      throw new BadRequestException('User with this email already exists');
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user and doctor in a transaction
    const result = await this.prisma.$transaction(async (prisma) => {
      // Create the user first
      const user = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          role: 'doctor',
        },
      });

      // Create the doctor record linked to the user
      const doctor = await prisma.doctor.create({
        data: {
          name,
          description,
          imageUrl,
          externalUrl,
          userId: user.id,
        },
        include: {
          user: true,
        },
      });

      return { user, doctor };
    });

    // Return user and doctor data without token (admin doesn't get logged in as the new doctor)
    return {
      user: {
        id: result.user.id,
        email: result.user.email,
        role: result.user.role,
      },
      doctor: {
        id: result.doctor.id,
        name: result.doctor.name,
        description: result.doctor.description,
        imageUrl: result.doctor.imageUrl,
        externalUrl: result.doctor.externalUrl,
        userId: result.doctor.userId,
      },
      credentials: {
        email: result.user.email,
        password: password, // Return plain password for admin to copy
      },
    };
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

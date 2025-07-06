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

  /**
   * Update doctor status (active/disabled)
   * @param doctorId - Doctor ID
   * @param status - New status ('active' | 'disabled')
   * @returns Updated doctor with user information
   */
  async updateDoctorStatus(doctorId: number, status: string) {
    // First get the doctor to find the associated user
    const doctor = await this.prisma.doctor.findUnique({
      where: { id: doctorId },
      include: { user: true }
    });

    if (!doctor) {
      throw new BadRequestException('Doctor not found');
    }

    // Update the user status
    const updatedUser = await this.prisma.user.update({
      where: { id: doctor.userId },
      data: { status },
      include: { doctor: true }
    });

    return {
      doctor: updatedUser.doctor,
      user: updatedUser
    };
  }

  /**
   * Update doctor profile information
   * @param doctorId - Doctor ID
   * @param data - Updated doctor information
   * @returns Updated doctor with user information
   */
  async updateDoctor(doctorId: number, data: {
    name: string;
    description: string;
    imageUrl: string;
    externalUrl: string;
    email: string;
  }) {
    const { name, description, imageUrl, externalUrl, email } = data;

    // Check if doctor exists
    const existingDoctor = await this.prisma.doctor.findUnique({
      where: { id: doctorId },
      include: { user: true }
    });

    if (!existingDoctor) {
      throw new BadRequestException('Doctor not found');
    }

    // Check if email is being changed and if it's already taken by another user
    if (email !== existingDoctor.user.email) {
      const emailExists = await this.prisma.user.findUnique({
        where: { email }
      });
      if (emailExists && emailExists.id !== existingDoctor.userId) {
        throw new BadRequestException('Email is already taken by another user');
      }
    }

    // Update both user and doctor in a transaction
    const result = await this.prisma.$transaction(async (prisma) => {
      // Update user email
      const updatedUser = await prisma.user.update({
        where: { id: existingDoctor.userId },
        data: { email }
      });

      // Update doctor information
      const updatedDoctor = await prisma.doctor.update({
        where: { id: doctorId },
        data: {
          name,
          description,
          imageUrl,
          externalUrl
        },
        include: { user: true }
      });

      return { user: updatedUser, doctor: updatedDoctor };
    });

    return result;
  }
}

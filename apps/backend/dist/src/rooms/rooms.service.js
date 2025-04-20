"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoomsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let RoomsService = class RoomsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    create(patientName, doctorId) {
        return this.prisma.room.create({ data: { patientName, doctorId } });
    }
    findAll(query, status, dateRange) {
        return this.prisma.room.findMany({
            where: {
                AND: [
                    status && status !== 'all'
                        ? { status }
                        : {},
                    query
                        ? {
                            OR: [
                                { doctor: { name: { contains: query } } },
                                { messages: { some: { content: { contains: query } } } },
                                { patientName: { contains: query } },
                            ]
                        }
                        : {},
                    (dateRange === null || dateRange === void 0 ? void 0 : dateRange.start) && (dateRange === null || dateRange === void 0 ? void 0 : dateRange.end)
                        ? {
                            createdAt: {
                                gte: new Date(dateRange.start),
                                lte: new Date(dateRange.end),
                            },
                        }
                        : {},
                ],
            },
            orderBy: {
                createdAt: 'desc',
            },
            include: {
                doctor: true,
                messages: {
                    orderBy: { createdAt: 'desc' },
                    take: 1,
                },
            },
        });
    }
    async findAllByUserId(userId, query, status, dateRange) {
        const doctor = await this.prisma.doctor.findUnique({
            where: { userId },
            select: { id: true },
        });
        if (!doctor) {
            throw new Error('Doctor not found for this user');
        }
        return this.prisma.room.findMany({
            where: {
                doctorId: doctor.id,
                AND: [
                    status && status !== 'all'
                        ? { status }
                        : {},
                    query
                        ? {
                            OR: [
                                { patientName: { contains: query } },
                                { messages: { some: { content: { contains: query } } } },
                            ],
                        }
                        : {},
                    (dateRange === null || dateRange === void 0 ? void 0 : dateRange.start) && (dateRange === null || dateRange === void 0 ? void 0 : dateRange.end)
                        ? {
                            createdAt: {
                                gte: new Date(dateRange.start),
                                lte: new Date(dateRange.end),
                            },
                        }
                        : {},
                ],
            },
            include: {
                doctor: true,
                // patient: true,
                messages: {
                    orderBy: { createdAt: 'desc' },
                    take: 1,
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
    }
    findById(id) {
        return this.prisma.room.findUnique({
            where: { id },
            include: {
                doctor: true,
            },
        });
    }
    async markRoomAsCompleted(id) {
        return this.prisma.room.update({
            where: { id },
            data: { status: 'completed' },
            include: {
                doctor: true,
            }
        });
    }
};
exports.RoomsService = RoomsService;
exports.RoomsService = RoomsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], RoomsService);

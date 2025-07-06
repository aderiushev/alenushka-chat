"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const jwt_service_1 = require("./jwt.service");
const bcrypt = __importStar(require("bcryptjs"));
let AuthService = class AuthService {
    constructor(prisma, jwtService) {
        this.prisma = prisma;
        this.jwtService = jwtService;
    }
    async register(email, password) {
        const hashed = await bcrypt.hash(password, 10);
        const user = await this.prisma.user.create({ data: { email, password: hashed, role: 'doctor' } });
        return { token: this.jwtService.sign(user) };
    }
    /**
     * Register a new doctor with both User and Doctor records in a transaction
     * @param data - Doctor registration data including user and doctor fields
     * @returns Object containing user and doctor information (no token for admin registration)
     */
    async registerDoctor(data) {
        const { email, password, name, description, imageUrl, externalUrl } = data;
        // Check if user with this email already exists
        const existingUser = await this.prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            throw new common_1.BadRequestException('User with this email already exists');
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
    async login(email, password) {
        const user = await this.prisma.user.findUnique({ where: { email } });
        if (!user || !(await bcrypt.compare(password, user.password))) {
            throw new common_1.UnauthorizedException();
        }
        return { token: this.jwtService.sign(user) };
    }
    async update(id, payload) {
        const user = await this.prisma.user.update({
            where: { id },
            data: {
                fcmToken: payload.fcmToken
            }
        });
        return {
            user
        };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService, jwt_service_1.JwtService])
], AuthService);

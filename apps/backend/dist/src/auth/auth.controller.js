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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const common_1 = require("@nestjs/common");
const auth_service_1 = require("./auth.service");
const prisma_service_1 = require("../prisma/prisma.service");
const roles_decorator_1 = require("./roles.decorator");
const roles_guard_1 = require("./roles.guard");
const jwt_service_1 = require("./jwt.service");
let AuthController = class AuthController {
    constructor(authService, prisma, jwtService) {
        this.authService = authService;
        this.prisma = prisma;
        this.jwtService = jwtService;
    }
    async register(body) {
        return this.authService.register(body.email, body.password);
    }
    /**
     * Register a new doctor (admin-only endpoint)
     * Creates both User and Doctor records in a transaction
     */
    async registerDoctor(body) {
        return this.authService.registerDoctor(body);
    }
    async login(body) {
        return this.authService.login(body.email, body.password);
    }
    async getDoctors() {
        return this.prisma.doctor.findMany({
            include: {
                user: true,
            },
        });
    }
    async me(req) {
        const authHeader = req.headers['authorization'];
        const token = authHeader.split(' ')[1];
        const user = this.jwtService.verify(token);
        return this.prisma.user.findUnique({
            where: { id: Number(user.sub) },
            include: { doctor: true },
        });
    }
    async getDoctorById(id) {
        return this.prisma.doctor.findUnique({
            where: { id: Number(id) },
            include: { user: true },
        });
    }
    async updateFcmToken(req, body) {
        const authHeader = req.headers['authorization'];
        const token = authHeader.split(' ')[1];
        const user = this.jwtService.verify(token);
        return this.authService.update(Number(user.sub), { fcmToken: body.fcmToken });
    }
    /**
     * Toggle doctor status between active and disabled (admin-only endpoint)
     */
    async toggleDoctorStatus(id, body) {
        return this.authService.updateDoctorStatus(Number(id), body.status);
    }
    /**
     * Update doctor profile information (admin-only endpoint)
     */
    async updateDoctor(id, body) {
        return this.authService.updateDoctor(Number(id), body);
    }
};
exports.AuthController = AuthController;
__decorate([
    (0, common_1.Post)('register'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "register", null);
__decorate([
    (0, roles_decorator_1.Roles)('admin'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, common_1.Post)('register-doctor'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "registerDoctor", null);
__decorate([
    (0, common_1.Post)('login'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "login", null);
__decorate([
    (0, roles_decorator_1.Roles)('admin'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, common_1.Get)('doctors'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "getDoctors", null);
__decorate([
    (0, common_1.Get)('me'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Request]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "me", null);
__decorate([
    (0, common_1.Get)('doctors/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "getDoctorById", null);
__decorate([
    (0, common_1.Post)('update-fcm-token'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Request, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "updateFcmToken", null);
__decorate([
    (0, roles_decorator_1.Roles)('admin'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, common_1.Patch)('doctors/:id/status'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "toggleDoctorStatus", null);
__decorate([
    (0, roles_decorator_1.Roles)('admin'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, common_1.Put)('doctors/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "updateDoctor", null);
exports.AuthController = AuthController = __decorate([
    (0, common_1.Controller)('auth'),
    __metadata("design:paramtypes", [auth_service_1.AuthService, prisma_service_1.PrismaService, jwt_service_1.JwtService])
], AuthController);

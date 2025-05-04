"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const chat_gateway_1 = require("./chat/chat.gateway");
const chat_service_1 = require("./chat/chat.service");
const prisma_service_1 = require("./prisma/prisma.service");
const rooms_module_1 = require("./rooms/rooms.module");
const upload_controller_1 = require("./upload/upload.controller");
const auth_module_1 = require("./auth/auth.module");
require("./firebase");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [auth_module_1.AuthModule, rooms_module_1.RoomsModule],
        controllers: [upload_controller_1.UploadController],
        providers: [chat_gateway_1.ChatGateway, chat_service_1.ChatService, prisma_service_1.PrismaService],
    })
], AppModule);

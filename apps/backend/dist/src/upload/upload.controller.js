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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UploadController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const firebase_1 = require("../firebase");
const uuid_1 = require("uuid");
const sharp_1 = __importDefault(require("sharp"));
let UploadController = class UploadController {
    async uploadFile(file) {
        // Check if the file is an image
        if (!file.mimetype.startsWith('image/')) {
            // If not an image, upload as is
            const blob = firebase_1.bucket.file(`${(0, uuid_1.v4)()}`);
            const blobStream = blob.createWriteStream({
                metadata: {
                    contentType: file.mimetype,
                },
            });
            return new Promise((resolve, reject) => {
                blobStream.on('error', (err) => reject(err));
                blobStream.on('finish', async () => {
                    await blob.makePublic();
                    const publicUrl = `https://storage.googleapis.com/${firebase_1.bucket.name}/${blob.name}`;
                    resolve({ url: publicUrl });
                });
                blobStream.end(file.buffer);
            });
        }
        // If it is an image, process it with Sharp
        try {
            const filename = `${(0, uuid_1.v4)()}.webp`;
            const processed = await (0, sharp_1.default)(file.buffer)
                .resize(1024, 1024, {
                fit: 'cover',
                withoutEnlargement: true
            })
                .webp({ quality: 50 })
                .toBuffer();
            const fileRef = firebase_1.bucket.file(filename);
            await fileRef.save(processed, {
                metadata: {
                    contentType: 'image/webp'
                }
            });
            await fileRef.makePublic();
            const publicUrl = `https://storage.googleapis.com/${firebase_1.bucket.name}/${filename}`;
            return { url: publicUrl };
        }
        catch (error) {
            throw new Error(`Failed to process image: ${error.message}`);
        }
    }
};
exports.UploadController = UploadController;
__decorate([
    (0, common_1.Post)('file'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    __param(0, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UploadController.prototype, "uploadFile", null);
exports.UploadController = UploadController = __decorate([
    (0, common_1.Controller)('upload')
], UploadController);

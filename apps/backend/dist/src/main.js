"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const path_1 = require("path");
const fs_1 = __importDefault(require("fs"));
async function bootstrap() {
    var _a;
    const httpsOptions = {
        key: fs_1.default.readFileSync('./secrets/private-key.pem'),
        cert: fs_1.default.readFileSync('./secrets/public-certificate.pem'),
    };
    const app = await core_1.NestFactory.create(app_module_1.AppModule, {
        httpsOptions
    });
    app.enableCors();
    app.useStaticAssets((0, path_1.join)(__dirname, '..', 'uploads'), { prefix: '/uploads' });
    await app.listen((_a = process.env.PORT) !== null && _a !== void 0 ? _a : 4001);
}
bootstrap();

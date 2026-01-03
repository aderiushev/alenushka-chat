"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const path_1 = require("path");
// import fs from 'fs';
// import * as dotenv from 'dotenv';
// dotenv.config();
async function bootstrap() {
    // const httpsOptions = {
    //   key: fs.readFileSync('./secrets/private-key.pem'),
    //   cert: fs.readFileSync('./secrets/public-certificate.pem'),
    // };
    var _a;
    const app = await core_1.NestFactory.create(app_module_1.AppModule, {
    // httpsOptions
    });
    app.enableCors();
    app.useStaticAssets((0, path_1.join)(__dirname, '..', 'uploads'), { prefix: '/uploads' });
    await app.listen((_a = process.env.PORT) !== null && _a !== void 0 ? _a : 3014);
}
bootstrap();

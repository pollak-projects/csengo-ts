import { Injectable } from '@nestjs/common';
import { MulterModuleOptions, MulterOptionsFactory } from '@nestjs/platform-express';
import * as process from 'node:process';
import { diskStorage } from 'multer';
import { join } from 'path';

@Injectable()
export class MulterConfigService implements MulterOptionsFactory {
    createMulterOptions(): MulterModuleOptions {
        return {
            storage: diskStorage({
                destination: function (req, file, cb) {
                    cb(null, join(process.cwd(), process.env.UPLOAD_PATH!));
                },
                filename: function (req, file, cb) {
                    cb(null, `${Date.now()}-${file.originalname}`);
                },
            }),
            preservePath: true,
            dest: join(process.cwd(), process.env.UPLOAD_PATH!),
        };
    }
}

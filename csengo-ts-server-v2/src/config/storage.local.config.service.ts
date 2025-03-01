import { Injectable } from '@nestjs/common';
import { diskStorage } from 'multer';
import { join } from 'path';
import * as process from 'node:process';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class StorageLocalConfigService {
    constructor(private readonly configService: ConfigService) {}

    getMulterStorage() {
        return diskStorage({
            destination: (req, file, cb) => {
                cb(null, join(process.cwd(), this.configService.get<string>('UPLOAD_PATH')!));
            },
            filename: function (req, file, cb) {
                cb(null, `${Date.now()}-${file.originalname}`);
            },
        });
    }
}

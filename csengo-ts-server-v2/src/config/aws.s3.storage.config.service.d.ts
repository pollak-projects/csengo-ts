import { Injectable } from '@nestjs/common';
import * as multerS3 from 'multer-s3';
import { v4 as uuidv4 } from 'uuid';
import { ConfigService } from '@nestjs/config';
import { AwsS3ClientConfigService } from './aws.s3.client.config.service';

@Injectable()
export class AwsS3StorageConfigService {
    constructor(
        private readonly configService: ConfigService,
        private readonly awsS3ClientConfigService: AwsS3ClientConfigService,
    ) {}

    getMulterStorage() {
        return multerS3({
            s3: this.awsS3ClientConfigService.getS3ClientConfig(),
            bucket: this.configService.get<string>('AWS_S3_BUCKET_NAME')!,
            metadata: (req, file, callback) => {
                callback(null, { fieldName: file.fieldname });
            },
            key: (req, file, callback) => {
                const uniqueSuffix = `${uuidv4()}${file.originalname}`;
                callback(null, uniqueSuffix);
            },
        });
    }
}

import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client } from '@aws-sdk/client-s3';

@Injectable()
export class AwsS3ClientConfigService {
    private readonly s3Client: S3Client;

    constructor(private readonly configService: ConfigService) {
        this.s3Client = new S3Client({
            region: this.configService.get<string>('AWS_REGION')!,
            endpoint: this.configService.get<string>('AWS_S3_BUCKET_DOCKER_URL')!,
            credentials: {
                accessKeyId: this.configService.get<string>('AWS_ACCESS_KEY_ID')!,
                secretAccessKey: this.configService.get<string>('AWS_SECRET_ACCESS_KEY')!,
            },
        });
    }

    getS3ClientConfig() {
        return this.s3Client;
    }
}

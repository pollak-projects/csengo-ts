import { Global, Logger, Module } from '@nestjs/common';
import { PrismaConfigService } from './prisma.config.service';
import { MulterConfigService } from './multer.config.service';
import { MulterModule } from '@nestjs/platform-express';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AwsS3StorageConfigService } from './aws.s3.storage.config.service';
import { StorageLocalConfigService } from './storage.local.config.service';
import { AwsS3ClientConfigService } from './aws.s3.client.config.service';
import { mkdirSync } from 'fs';
import { join } from 'path';
import * as process from 'node:process';
import { WebsocketModule } from '../module/websocket/websocket.module';

@Global()
@Module({
    imports: [
        ConfigModule.forRoot(),
        MulterModule.registerAsync({
            imports: [ConfigModule],
            inject: [ConfigService, AwsS3ClientConfigService],
            useFactory: async (configService: ConfigService, AwsS3ClientConfigService: AwsS3ClientConfigService) => {
                // This has been left here if someone EVER wants to migrate to Localstack S3
                // const storageProvider = configService.get<string>('STORAGE_PROVIDER');
                const storageProvider = 'local';
                const logger = new Logger('MulterModuleRegisterAsync');
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-expect-error
                if (storageProvider === 's3') {
                    logger.log(`Using S3 storage provider with the following configuration: ${JSON.stringify(AwsS3ClientConfigService.getS3ClientConfig())}`);
                    const s3StorageProvider = new AwsS3StorageConfigService(configService, AwsS3ClientConfigService);
                    return {
                        storage: s3StorageProvider.getMulterStorage(),
                    };
                } else {
                    logger.log('Using local storage provider');
                    logger.verbose(`Creating directory: ${join(process.cwd(), configService.get<string>('UPLOAD_PATH')!)}`);
                    mkdirSync(join(process.cwd(), configService.get<string>('UPLOAD_PATH')!), { recursive: true });
                    const localStorageProvider = new StorageLocalConfigService(configService);
                    return {
                        storage: localStorageProvider.getMulterStorage(),
                    };
                }
            },
        }),
        WebsocketModule,
    ],
    providers: [ConfigService, PrismaConfigService, MulterConfigService, Logger, AwsS3ClientConfigService],
    exports: [MulterModule, WebsocketModule, ConfigService, PrismaConfigService, MulterConfigService, Logger, AwsS3ClientConfigService],
})
export class ConfigLocalModule {}

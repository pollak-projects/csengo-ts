import { Global, Logger, Module } from '@nestjs/common';
import { PrismaConfigService } from './prisma.config.service';
import { MulterModule } from '@nestjs/platform-express';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { mkdirSync } from 'fs';
import { join } from 'path';
import * as process from 'node:process';
import { StorageLocalConfigService } from './storage.local.config.service';

@Global()
@Module({
    imports: [
        ConfigModule.forRoot(),
        MulterModule.registerAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: async (configService: ConfigService) => {
                const logger = new Logger('MulterModuleRegisterAsync');
                logger.log('Using local storage provider');
                logger.verbose(`Creating directory: ${join(process.cwd(), configService.get<string>('UPLOAD_PATH')!)}`);
                mkdirSync(join(process.cwd(), configService.get<string>('UPLOAD_PATH')!), { recursive: true });
                logger.verbose(`Creating directory: ${join(process.cwd(), configService.get<string>('UPLOAD_TEMP_PATH')!)}`);
                mkdirSync(join(process.cwd(), configService.get<string>('UPLOAD_TEMP_PATH')!), { recursive: true });
                const localStorageProvider = new StorageLocalConfigService(configService);
                return {
                    storage: localStorageProvider.getMulterStorage(),
                };
            },
        }),
    ],
    providers: [ConfigService, PrismaConfigService, Logger],
    exports: [MulterModule, ConfigService, PrismaConfigService, Logger],
})
export class ConfigLocalModule {}

import { Module } from '@nestjs/common';
import { SnipperService } from './snipper.service';
import { SnipperController } from './snipper.controller';
import { ConfigService } from '@nestjs/config';

@Module({
    imports: [],
    controllers: [SnipperController],
    providers: [SnipperService, ConfigService],
})
export class SnipperModule {}

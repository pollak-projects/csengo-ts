import { Module } from '@nestjs/common';
import { SongsController } from './songs.controller';
import { SongsService } from './songs.service';
import { PipeModule } from '../../filter/filter.module';

@Module({
    imports: [PipeModule],
    controllers: [SongsController],
    providers: [SongsService],
})
export class SongsModule {}

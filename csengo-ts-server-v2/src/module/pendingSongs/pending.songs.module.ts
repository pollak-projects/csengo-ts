import { Module } from '@nestjs/common';
import { PendingSongsController } from './pending.songs.controller';
import { PendingSongsService } from './pending.songs.service';

@Module({
    imports: [],
    controllers: [PendingSongsController],
    providers: [PendingSongsService],
})
export class PendingSongsModule {}

import { Module } from '@nestjs/common';
import { DeleteFileOnErrorFilter } from './delete.file.on.error.filter';

@Module({
    imports: [],
    controllers: [],
    providers: [DeleteFileOnErrorFilter],
    exports: [DeleteFileOnErrorFilter],
})
export class PipeModule {}

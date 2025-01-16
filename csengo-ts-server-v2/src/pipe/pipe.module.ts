import { Module } from '@nestjs/common';
import { AudioLengthValidatorPipe } from './audio.length.validation.pipe.service';

@Module({
    imports: [],
    controllers: [],
    providers: [AudioLengthValidatorPipe],
    exports: [AudioLengthValidatorPipe],
})
export class PipeModule {}

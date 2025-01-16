import { Injectable, Logger } from '@nestjs/common';
import { FileValidator } from '@nestjs/common/pipes/file/file-validator.interface';
import { loadMusicMetadata } from 'music-metadata';

export type AudioLengthValidatorOptions = {
    length: number;
};

/**
 * Audio length validator pipe
 */
@Injectable()
export class AudioLengthValidatorPipe extends FileValidator<AudioLengthValidatorOptions, Express.Multer.File> {
    private readonly logger = new Logger(AudioLengthValidatorPipe.name);

    async isValid(file: Express.Multer.File): Promise<boolean> {
        this.logger.verbose(`Validating audio file ${file.originalname} with a maximum length of ${this.validationOptions.length} seconds.`);
        if (!file?.path) {
            this.logger.error(`File ${file.originalname} is empty or has no buffer.`);
            return false;
        }

        try {
            this.logger.verbose(`Parsing audio file ${file.originalname} to get its duration.`);
            const mm = await loadMusicMetadata();
            const metadata = await mm.parseFile(file.path);
            this.logger.verbose(`Parsed audio file ${file.originalname} successfully, metadata: ${JSON.stringify(metadata)}`);
            const duration = metadata.format.duration;
            this.logger.verbose(`Audio file ${file.originalname} has a duration of ${duration} seconds, ${JSON.stringify(metadata)}`);
            return duration !== undefined && duration <= this.validationOptions.length;
        } catch (error) {
            this.logger.error(`Error parsing audio file ${file.originalname}: ${error.message}, ${error}`);
            return false;
        }
    }

    buildErrorMessage(file: Express.Multer.File): string {
        return `The audio file ${file.originalname} exceeds the maximum allowed length of ${this.validationOptions.length} seconds.`;
    }
}

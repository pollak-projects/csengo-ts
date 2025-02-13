import { Test, TestingModule } from '@nestjs/testing';
import { AudioLengthValidatorPipe } from './audio.length.validation.pipe.service';
import { Logger } from '@nestjs/common';
import { loadMusicMetadata } from 'music-metadata';
import * as fs from 'fs';

jest.mock('music-metadata', () => ({
    loadMusicMetadata: jest.fn().mockReturnValue({
        parseFile: jest.fn(),
    }),
}));

jest.mock('fs', () => ({
    existsSync: jest.fn(() => true),
}));

describe('AudioLengthValidatorPipe', () => {
    let pipe: AudioLengthValidatorPipe;
    let mockMetadataParser;
    let loggerVerboseSpy: jest.SpyInstance;
    let loggerErrorSpy: jest.SpyInstance;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [AudioLengthValidatorPipe],
        }).compile();

        pipe = new AudioLengthValidatorPipe({ length: 15 });
        mockMetadataParser = loadMusicMetadata();

        loggerVerboseSpy = jest.spyOn(Logger.prototype, 'verbose').mockImplementation();
        loggerErrorSpy = jest.spyOn(Logger.prototype, 'error').mockImplementation();
    });

    it('should be defined', () => {
        expect(pipe).toBeDefined();
    });

    it('should return true if file duration is within limit', async () => {
        mockMetadataParser.parseFile.mockResolvedValue({
            format: { duration: 8 },
        });

        const file = { originalname: 'test.mp3', path: '/path/to/file.mp3' } as Express.Multer.File;
        const result = await pipe.isValid(file);

        console.log(result);
        expect(result).toBe(true);

        expect(loggerVerboseSpy).toHaveBeenCalled();
    });

    it('should return false if file duration exceeds limit', async () => {
        mockMetadataParser.parseFile.mockResolvedValue({
            format: { duration: 20 },
        });

        const file = { originalname: 'test.mp3', path: '/path/to/file.mp3' } as Express.Multer.File;
        const result = await pipe.isValid(file);
        expect(result).toBe(false);

        expect(loggerVerboseSpy).toHaveBeenCalled();
    });

    it('should return false if file has no path', async () => {
        const file = { originalname: 'test.mp3' } as Express.Multer.File;
        const result = await pipe.isValid(file);
        expect(result).toBe(false);

        expect(loggerVerboseSpy).toHaveBeenCalled();
        expect(loggerErrorSpy).toHaveBeenCalled();
    });

    it('should return false if an error occurs during parsing', async () => {
        mockMetadataParser.parseFile.mockRejectedValue(new Error('Parsing error'));

        const file = { originalname: 'test.mp3', path: '/path/to/file.mp3' } as Express.Multer.File;
        const result = await pipe.isValid(file);
        expect(result).toBe(false);

        expect(loggerVerboseSpy).toHaveBeenCalled();
        expect(loggerErrorSpy).toHaveBeenCalled();
    });

    it('should return proper error message', () => {
        const file = { originalname: 'test.mp3' } as Express.Multer.File;
        const errorMessage = pipe.buildErrorMessage(file);
        expect(errorMessage).toBe('The audio file test.mp3 exceeds the maximum allowed length of 15 seconds.');

        expect(loggerVerboseSpy).toHaveBeenCalled();
    });
});

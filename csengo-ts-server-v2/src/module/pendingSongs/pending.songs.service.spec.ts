import { Test, TestingModule } from '@nestjs/testing';
import { PendingSongsService } from './pending.songs.service';
import { PrismaConfigService } from '../../config/prisma.config.service';
import { HttpException, HttpStatus, Logger, StreamableFile } from '@nestjs/common';
import { RequestUser } from 'express';
import * as fs from 'fs';
import { createReadStream } from 'fs';

// Mock data
const mockRequestUser = {
    token: {
        username: 'testUser',
        sub: '123',
    },
} as RequestUser;

const mockPendingSongs = [
    {
        id: '1',
        title: 'Song 1',
        uploadedBy: {
            kreta: {
                name: 'John Doe',
            },
        },
    },
];

const mockSong = {
    id: '1',
    title: 'Song 1',
    songBucket: {
        path: 'path/to/song.mp3',
    },
};

describe('PendingSongsService', () => {
    let service: PendingSongsService;
    let prisma: PrismaConfigService;
    let loggerVerboseSpy: jest.SpyInstance;
    let loggerErrorSpy: jest.SpyInstance;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                PendingSongsService,
                {
                    provide: PrismaConfigService,
                    useValue: {
                        pendingSong: {
                            findMany: jest.fn(),
                            findUnique: jest.fn(),
                            delete: jest.fn(),
                        },
                        song: {
                            create: jest.fn(),
                        },
                    },
                },
            ],
        }).compile();

        service = module.get<PendingSongsService>(PendingSongsService);
        prisma = module.get<PrismaConfigService>(PrismaConfigService);

        loggerVerboseSpy = jest.spyOn(Logger.prototype, 'verbose').mockImplementation();
        loggerErrorSpy = jest.spyOn(Logger.prototype, 'error').mockImplementation();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('getAll', () => {
        it('should return all pending songs', async () => {
            prisma.pendingSong.findMany = jest.fn().mockResolvedValue(mockPendingSongs);

            const result = await service.getAll(mockRequestUser);
            expect(result).toEqual(mockPendingSongs);

            expect(loggerVerboseSpy).toHaveBeenCalled();
            expect(loggerErrorSpy).not.toHaveBeenCalled();
        });

        it('should throw an error when no pending songs are found', async () => {
            prisma.pendingSong.findMany = jest.fn().mockResolvedValue([]);

            await expect(service.getAll(mockRequestUser)).rejects.toThrow(new HttpException('No pending songs found', HttpStatus.NOT_FOUND));
        });

        it('should throw an error when an internal error occurs', async () => {
            prisma.pendingSong.findMany = jest.fn().mockRejectedValue(new Error('Database error'));

            await expect(service.getAll(mockRequestUser)).rejects.toThrow(
                new HttpException('Error fetching pending songs: Database error', HttpStatus.INTERNAL_SERVER_ERROR),
            );
        });
    });

    describe('getAudioById', () => {
        it('should return a streamable file', async () => {
            prisma.pendingSong.findUnique = jest.fn().mockResolvedValue(mockSong);
            jest.spyOn(fs, 'createReadStream').mockReturnValue({
                on: jest.fn().mockImplementation((event, callback) => {
                    if (event === 'open') callback();
                }),
            } as any);

            const result = await service.getAudioById('1', mockRequestUser);
            expect(result).toBeInstanceOf(StreamableFile);
        });

        it('should throw an error when song is not found', async () => {
            prisma.pendingSong.findUnique = jest.fn().mockResolvedValue(null);

            await expect(service.getAudioById('1', mockRequestUser)).rejects.toThrow(new HttpException('Song not found', HttpStatus.NOT_FOUND));
        });

        it('should throw an error when an internal error occurs', async () => {
            prisma.pendingSong.findUnique = jest.fn().mockRejectedValue(new Error('Database error'));

            await expect(service.getAudioById('1', mockRequestUser)).rejects.toThrow(
                new HttpException('Error fetching song: Database error', HttpStatus.INTERNAL_SERVER_ERROR),
            );
        });
    });

    describe('approveById', () => {
        it('should approve a pending song', async () => {
            prisma.pendingSong.findUnique = jest.fn().mockResolvedValue(mockSong);
            prisma.song.create = jest.fn().mockResolvedValue(mockSong);
            prisma.pendingSong.delete = jest.fn().mockResolvedValue(mockSong);

            const result = await service.approveById('1', mockRequestUser);
            expect(result).toEqual({ message: 'Peding song with id 1 sucessfully approved' });
        });

        it('should throw an error when pending song is not found', async () => {
            prisma.pendingSong.findUnique = jest.fn().mockResolvedValue(null);

            await expect(service.approveById('1', mockRequestUser)).rejects.toThrow(new HttpException('Pending song not found', HttpStatus.NOT_FOUND));
        });

        it('should throw an error when an internal error occurs', async () => {
            prisma.pendingSong.findUnique = jest.fn().mockRejectedValue(new Error('Database error'));

            await expect(service.approveById('1', mockRequestUser)).rejects.toThrow(
                new HttpException('Error fetching pending song: Database error', HttpStatus.INTERNAL_SERVER_ERROR),
            );
        });
    });

    describe('disapproveById', () => {
        it('should disapprove a pending song', async () => {
            prisma.pendingSong.findFirstOrThrow = jest.fn().mockResolvedValue(mockSong);
            prisma.pendingSong.delete = jest.fn().mockResolvedValue(mockSong);

            const result = await service.disapproveById('1', mockRequestUser);
            expect(result).toEqual({ message: 'Peding song with id 1 sucessfully disapproved' });
        });

        it('should throw an error when pending song is not found', async () => {
            prisma.pendingSong.findFirstOrThrow = jest.fn().mockRejectedValue(new Error('Record not found'));

            await expect(service.disapproveById('1', mockRequestUser)).rejects.toThrow(
                new HttpException('Error fetching pending song: Record not found', HttpStatus.NOT_FOUND),
            );
        });

        it('should throw an error when an internal error occurs', async () => {
            prisma.pendingSong.findFirstOrThrow = jest.fn().mockRejectedValue(new Error('Database error'));

            await expect(service.disapproveById('1', mockRequestUser)).rejects.toThrow(
                new HttpException('Error fetching pending song: Database error', HttpStatus.INTERNAL_SERVER_ERROR),
            );
        });
    });
});

import { Test, TestingModule } from '@nestjs/testing';
import { SongsService } from './songs.service';
import { PrismaConfigService } from '../../config/prisma.config.service';
import { ConfigService } from '@nestjs/config';
import { HttpException, HttpStatus, Logger, StreamableFile } from '@nestjs/common';
import { RequestUser, Response } from 'express';
import { CreateSongDto } from './dto/create.song.dto';
import { Readable } from 'stream';
import * as fs from 'fs';
import * as archiver from 'archiver';

// Mock data
const mockRequestUser = {
    token: {
        username: 'testUser',
        sub: '123',
    },
} as RequestUser;

const mockResponse = {
    attachment: jest.fn(),
    pipe: jest.fn(),
} as unknown as Response;

const mockVotingSession = {
    id: 'sessionId',
    songs: [
        {
            id: 'songId',
            title: 'Test Song',
            songBucket: {
                path: 'path/to/song.mp3',
            },
        },
    ],
};

const mockSong = {
    id: 'songId',
    title: 'Test Song',
    songBucket: {
        path: 'path/to/song.mp3',
    },
};

// const mockRimraf = jest.fn();
// jest.mock('rimraf', () => {
//     return jest.fn().mockImplementation(() => {
//         return { __esModule: true, rimraf: mockRimraf };
//     });
// });
const mockRimraf = jest.fn();

// jest.mock('rimraf', () => {
//     const originalModule = jest.requireActual('rimraf');
//     return jest.fn().mockImplementation(() => {
//         return {
//             ...originalModule,
//             rimraf: mockRimraf,
//         };
//     });
// });

describe('SongsService', () => {
    let service: SongsService;
    let prisma: PrismaConfigService;
    let loggerVerboseSpy: jest.SpyInstance;
    let loggerErrorSpy: jest.SpyInstance;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                SongsService,
                {
                    provide: PrismaConfigService,
                    useValue: {
                        votingSession: {
                            findFirst: jest.fn(),
                        },
                        song: {
                            findMany: jest.fn(),
                            findUnique: jest.fn(),
                            delete: jest.fn(),
                            update: jest.fn(),
                        },
                        vote: {
                            groupBy: jest.fn(),
                        },
                        pendingSong: {
                            create: jest.fn(),
                        },
                    },
                },
                {
                    provide: ConfigService,
                    useValue: {},
                },
            ],
        }).compile();

        service = module.get<SongsService>(SongsService);
        prisma = module.get<PrismaConfigService>(PrismaConfigService);

        loggerVerboseSpy = jest.spyOn(Logger.prototype, 'verbose').mockImplementation();
        loggerErrorSpy = jest.spyOn(Logger.prototype, 'error').mockImplementation();

        jest.mock('rimraf', () => ({
            rimraf: mockRimraf,
        }));

        jest.mock('archiver');

        jest.mock('fs', () => ({
            createReadStream: jest.fn(),
        }));
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('getAllAudioInSession', () => {
        it('should return a zip file of songs in session', async () => {
            prisma.votingSession.findFirst = jest.fn().mockResolvedValue(mockVotingSession);

            prisma.votingSession.findFirst = jest.fn().mockResolvedValue(mockVotingSession);

            const mockArchive = {
                pipe: jest.fn(),
                file: jest.fn(),
                finalize: jest.fn().mockResolvedValue(undefined),
            };
            jest.spyOn(archiver, 'create').mockReturnValue(mockArchive as any);

            const mockResponse = {
                attachment: jest.fn(),
                pipe: jest.fn(),
            } as unknown as Response;

            const result = await service.getAllAudioInSession(mockRequestUser, mockResponse);
            expect(result).toBeTruthy();
            expect(mockResponse.attachment).toHaveBeenCalledWith('songs.zip');
            expect(mockArchive.pipe).toHaveBeenCalledWith(mockResponse);
            expect(mockArchive.file).toHaveBeenCalledTimes(mockVotingSession.songs.length);
            expect(mockArchive.finalize).toHaveBeenCalled();
            expect(loggerVerboseSpy).toHaveBeenCalled();
            expect(loggerErrorSpy).not.toHaveBeenCalled();
        });

        it('should throw an error when no active voting session is found', async () => {
            prisma.votingSession.findFirst = jest.fn().mockResolvedValue(null);

            await expect(service.getAllAudioInSession(mockRequestUser, mockResponse)).rejects.toThrow(
                new HttpException('No active voting session found', HttpStatus.NOT_FOUND),
            );
        });
    });

    describe('getAllInSession', () => {
        it('should return a list of songs in session', async () => {
            prisma.votingSession.findFirst = jest.fn().mockResolvedValue(mockVotingSession);

            const result = await service.getAllInSession(mockRequestUser);
            expect(result).toEqual({
                sessionId: 'sessionId',
                songs: [
                    {
                        songId: 'songId',
                        songTitle: 'Test Song',
                    },
                ],
            });
        });

        it('should throw an error when no active voting session is found', async () => {
            prisma.votingSession.findFirst = jest.fn().mockResolvedValue(null);

            await expect(service.getAllInSession(mockRequestUser)).rejects.toThrow(new HttpException('No active voting session found', HttpStatus.NOT_FOUND));
        });
    });

    describe('getAll', () => {
        it('should return a list of all songs', async () => {
            prisma.song.findMany = jest.fn().mockResolvedValue([mockSong]);

            const result = await service.getAll(mockRequestUser);
            expect(result).toEqual([
                {
                    id: 'songId',
                    title: 'Test Song',
                },
            ]);
        });

        it('should throw an error when no songs are found', async () => {
            prisma.song.findMany = jest.fn().mockResolvedValue([]);

            await expect(service.getAll(mockRequestUser)).rejects.toThrow(new HttpException('No songs found', HttpStatus.NOT_FOUND));
        });
    });

    describe('getWinner', () => {
        it('should return the winner song', async () => {
            prisma.votingSession.findFirst = jest.fn().mockResolvedValue(mockVotingSession);
            prisma.vote.groupBy = jest.fn().mockResolvedValue([{ songId: 'songId', _count: { songId: 1 } }]);
            prisma.song.findUnique = jest.fn().mockResolvedValue(mockSong);

            const result = await service.getWinner(mockRequestUser);
            expect(result).toEqual(mockSong);
        });

        it('should throw an error when no finished voting session is found', async () => {
            prisma.votingSession.findFirst = jest.fn().mockResolvedValue(null);

            await expect(service.getWinner(mockRequestUser)).rejects.toThrow(
                new HttpException('No finished voting session found', HttpStatus.INTERNAL_SERVER_ERROR),
            );
        });
    });

    describe('getWinnerAudio', () => {
        it('should return winner audio', async () => {
            prisma.votingSession.findFirst = jest.fn().mockResolvedValue(mockVotingSession);
            prisma.vote.groupBy = jest.fn().mockResolvedValue([{ songId: 'songId', _count: { songId: 1 } }]);
            prisma.song.findUnique = jest.fn().mockResolvedValue(mockSong);

            const mockStream = new Readable();
            jest.spyOn(fs, 'createReadStream').mockImplementation(() => {
                process.nextTick(() => mockStream.emit('open'));
                return mockStream as any;
            });

            const result = await service.getWinnerAudio(mockRequestUser);
            expect(result).toBeInstanceOf(StreamableFile);
        });

        it('should throw an error when no finished voting session is found', async () => {
            prisma.votingSession.findFirst = jest.fn().mockResolvedValue(null);

            await expect(service.getWinnerAudio(mockRequestUser)).rejects.toThrow(
                new HttpException('No finished voting session found', HttpStatus.INTERNAL_SERVER_ERROR),
            );
        });
    });

    describe('getAudioById', () => {
        it('should return a StreamableFile for the given song id', async () => {
            prisma.song.findUnique = jest.fn().mockResolvedValue(mockSong);

            const mockStream = new Readable();
            jest.spyOn(fs, 'createReadStream').mockImplementation(() => {
                process.nextTick(() => mockStream.emit('open'));
                return mockStream as any;
            });

            const result = await service.getAudioById('songId', mockRequestUser);
            expect(result).toBeInstanceOf(StreamableFile);
        });

        it('should throw an error when song is not found', async () => {
            prisma.song.findUnique = jest.fn().mockResolvedValue(null);

            await expect(service.getAudioById('songId', mockRequestUser)).rejects.toThrow(new HttpException('Song not found', HttpStatus.NOT_FOUND));
        });
    });

    describe('upload', () => {
        it('should upload a song', async () => {
            const mockFile = { path: 'path/to/song.mp3' } as Express.Multer.File;
            const mockCreateSongDto = { title: 'Test Song' } as CreateSongDto;
            const mockResult = { id: 'songId', title: 'Test Song' };

            prisma.pendingSong.create = jest.fn().mockResolvedValue(mockResult);

            const result = await service.upload(mockCreateSongDto, mockRequestUser, mockFile);
            expect(result).toEqual(mockResult);
        });

        it('should throw an error when upload fails', async () => {
            const mockFile = { path: 'path/to/song.mp3' } as Express.Multer.File;
            const mockCreateSongDto = { title: 'Test Song' } as CreateSongDto;

            prisma.pendingSong.create = jest.fn().mockRejectedValue(new Error('Upload failed'));

            await expect(service.upload(mockCreateSongDto, mockRequestUser, mockFile)).rejects.toThrow(
                new HttpException('Error uploading song into pending songs: Upload failed', HttpStatus.INTERNAL_SERVER_ERROR),
            );
        });
    });

    describe('uploadDirect', () => {
        it('should upload a song directly', async () => {
            const mockFile = { path: 'path/to/song.mp3' } as Express.Multer.File;
            const mockCreateSongDto = { title: 'Test Song' } as CreateSongDto;
            const mockResult = { id: 'songId', title: 'Test Song' };

            prisma.song.create = jest.fn().mockResolvedValue(mockResult);

            const result = await service.uploadDirect(mockCreateSongDto, mockRequestUser, mockFile);
            expect(result).toEqual(mockResult);
        });

        it('should throw an error when direct upload fails', async () => {
            const mockFile = { path: 'path/to/song.mp3' } as Express.Multer.File;
            const mockCreateSongDto = { title: 'Test Song' } as CreateSongDto;

            prisma.song.create = jest.fn().mockRejectedValue(new Error('Upload failed'));

            await expect(service.uploadDirect(mockCreateSongDto, mockRequestUser, mockFile)).rejects.toThrow(
                new HttpException('Error uploading song directly into songs: Upload failed', HttpStatus.INTERNAL_SERVER_ERROR),
            );
        });
    });

    describe('renameById', () => {
        it('should rename a song', async () => {
            const mockResult = { id: 'songId', title: 'New Title' };

            prisma.song.findUnique = jest.fn().mockResolvedValue(mockSong);
            prisma.song.update = jest.fn().mockResolvedValue(mockResult);

            const result = await service.renameById('songId', 'New Title', mockRequestUser);
            expect(result).toEqual({ message: `Song renamed successfully to ${mockResult.title}` });
        });

        it('should throw an error when rename fails', async () => {
            prisma.song.findUnique = jest.fn().mockResolvedValue(mockSong);
            prisma.song.update = jest.fn().mockRejectedValue(new Error('Rename failed'));

            await expect(service.renameById('songId', 'New Title', mockRequestUser)).rejects.toThrow(
                new HttpException('Error renaming song: Rename failed', HttpStatus.INTERNAL_SERVER_ERROR),
            );
        });
    });

    describe('deleteById', () => {
        it('should delete a song', async () => {
            prisma.song.findUnique = jest.fn().mockResolvedValue(mockSong);
            mockRimraf.mockImplementation((path, callback) => callback(null));
            prisma.song.delete = jest.fn().mockResolvedValue(mockSong);

            const result = await service.deleteById('songId', mockRequestUser);
            expect(result).toEqual({ message: 'Song deleted successfully' });
        });

        it('should throw an error when delete fails', async () => {
            prisma.song.findUnique = jest.fn().mockResolvedValue(mockSong);
            prisma.song.delete = jest.fn().mockRejectedValue(new Error('Delete failed'));

            await expect(service.deleteById('songId', mockRequestUser)).rejects.toThrow(
                new HttpException('Error deleting song: Delete failed', HttpStatus.INTERNAL_SERVER_ERROR),
            );
        });
    });
});

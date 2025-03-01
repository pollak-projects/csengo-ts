import { Test, TestingModule } from '@nestjs/testing';
import { SongsController } from './songs.controller';
import { SongsService } from './songs.service';
import { StreamableFile } from '@nestjs/common';
import { Response } from 'express';
import { RequestUser } from 'express';
import { RoleEnum } from '../role/role.enum';
import { PrismaConfigService } from '../../config/prisma.config.service';
import { ConfigService } from '@nestjs/config';
import { CreateSongDto } from './dto/create.song.dto';
import { JwtService } from '@nestjs/jwt';

describe('SongsController', () => {
    let songsController: SongsController;
    let songsService: SongsService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [SongsController],
            providers: [
                {
                    provide: SongsService,
                    useValue: {
                        getAllAudioInSession: jest.fn().mockResolvedValue({ audios: [] }),
                        getAllInSession: jest.fn().mockResolvedValue({ songs: [] }),
                        getAll: jest.fn().mockResolvedValue({ songs: [] }),
                        getWinner: jest.fn().mockResolvedValue({ success: true }),
                        getWinnerAudio: jest.fn().mockResolvedValue(new StreamableFile(Buffer.from('audio'))),
                        getAudioById: jest.fn().mockResolvedValue(new StreamableFile(Buffer.from('audio'))),
                        updateAudio: jest.fn().mockResolvedValue({ success: true }),
                        startAudio: jest.fn().mockResolvedValue({ success: true }),
                        stopAudio: jest.fn().mockResolvedValue({ success: true }),
                        upload: jest.fn().mockResolvedValue({ success: true }),
                        uploadDirect: jest.fn().mockResolvedValue({ success: true }),
                        renameById: jest.fn().mockResolvedValue({ success: true }),
                        deleteById: jest.fn().mockResolvedValue({ success: true }),
                    },
                },
                PrismaConfigService,
                ConfigService,
                JwtService,
            ],
        }).compile();

        songsController = module.get<SongsController>(SongsController);
        songsService = module.get<SongsService>(SongsService);
    });

    it('should be defined', () => {
        expect(songsController).toBeDefined();
    });

    describe('getAllAudioInSession', () => {
        it('should return all audio in session for public access', async () => {
            const mockRequest = {
                token: { sub: 'mockedId', username: 'mockedUser', roles: [RoleEnum.Admin], hashedPassword: 'mocked-password' },
            } as RequestUser;
            const result = await songsController.getAllAudioInSession(mockRequest, {} as Response);
            expect(result).toEqual({ audios: [] });
            expect(songsService.getAllAudioInSession).toHaveBeenCalledWith(mockRequest, {} as Response);
        });
    });

    describe('getAllInSession', () => {
        it('should return all songs in session', async () => {
            const mockRequest = {
                token: { sub: 'mockedId', username: 'mockedUser', roles: [RoleEnum.Admin], hashedPassword: 'mocked-password' },
            } as RequestUser;
            const result = await songsController.getAllInSession(mockRequest);
            expect(result).toEqual({ songs: [] });
            expect(songsService.getAllInSession).toHaveBeenCalledWith(mockRequest);
        });
    });

    describe('getAll', () => {
        it('should return all songs for admin', async () => {
            const mockRequest = {
                token: { sub: 'mockedId', username: 'mockedUser', roles: [RoleEnum.Admin], hashedPassword: 'mocked-password' },
            } as RequestUser;
            const result = await songsController.getAll(mockRequest);
            expect(result).toEqual({ songs: [] });
            expect(songsService.getAll).toHaveBeenCalledWith(mockRequest);
        });
    });

    describe('getWinner', () => {
        it('should return the winner song', async () => {
            const mockRequest = {
                token: { sub: 'mockedId', username: 'mockedUser', roles: [RoleEnum.Admin], hashedPassword: 'mocked-password' },
            } as RequestUser;
            const result = await songsController.getWinner(mockRequest);
            expect(result).toEqual({ success: true });
            expect(songsService.getWinner).toHaveBeenCalledWith(mockRequest);
        });
    });

    describe('getWinnerAudio', () => {
        it('should return winner audio', async () => {
            const mockRequest = {
                token: { sub: 'mockedId', username: 'mockedUser', roles: [RoleEnum.Admin], hashedPassword: 'mocked-password' },
            } as RequestUser;
            const result = await songsController.getWinnerAudio(mockRequest);
            expect(result).toBeInstanceOf(StreamableFile);
            expect(songsService.getWinnerAudio).toHaveBeenCalledWith(mockRequest);
        });
    });

    describe('getAudioById', () => {
        it('should return audio by ID', async () => {
            const mockRequest = {
                token: { sub: 'mockedId', username: 'mockedUser', roles: [RoleEnum.Admin], hashedPassword: 'mocked-password' },
            } as RequestUser;
            const result = await songsController.getAudioById('1', mockRequest);
            expect(result).toBeInstanceOf(StreamableFile);
            expect(songsService.getAudioById).toHaveBeenCalledWith('1', mockRequest);
        });
    });

    describe('upload', () => {
        it('should upload a song', async () => {
            const mockRequest = {
                token: { sub: 'mockedId', username: 'mockedUser', roles: [RoleEnum.Admin], hashedPassword: 'mocked-password' },
            } as RequestUser;
            const file = { mimetype: 'audio/mpeg' } as Express.Multer.File;
            const result = await songsController.upload({ title: 'mocked-title' } as CreateSongDto, mockRequest, file);
            expect(result).toEqual({ success: true });
            expect(songsService.upload).toHaveBeenCalledWith({ title: 'mocked-title' } as CreateSongDto, mockRequest, file);
        });
    });

    describe('uploadDirect', () => {
        it('should upload a song directly for admin', async () => {
            const mockRequest = {
                token: { sub: 'mockedId', username: 'mockedUser', roles: [RoleEnum.Admin], hashedPassword: 'mocked-password' },
            } as RequestUser;
            const file = { mimetype: 'audio/mpeg' } as Express.Multer.File;
            const result = await songsController.uploadDirect({ title: 'mocked-title' } as CreateSongDto, mockRequest, file);
            expect(result).toEqual({ success: true });
            expect(songsService.uploadDirect).toHaveBeenCalledWith({ title: 'mocked-title' } as CreateSongDto, mockRequest, file);
        });
    });

    describe('renameById', () => {
        it('should rename a song for admin', async () => {
            const mockRequest = {
                token: { sub: 'mockedId', username: 'mockedUser', roles: [RoleEnum.Admin], hashedPassword: 'mocked-password' },
            } as RequestUser;
            const result = await songsController.renameById('1', 'new name', mockRequest);
            expect(result).toEqual({ success: true });
            expect(songsService.renameById).toHaveBeenCalledWith('1', 'new name', mockRequest);
        });
    });

    describe('deleteById', () => {
        it('should delete a song for admin', async () => {
            const mockRequest = {
                token: { sub: 'mockedId', username: 'mockedUser', roles: [RoleEnum.Admin], hashedPassword: 'mocked-password' },
            } as RequestUser;
            const result = await songsController.deleteById('1', mockRequest);
            expect(result).toEqual({ success: true });
            expect(songsService.deleteById).toHaveBeenCalledWith('1', mockRequest);
        });
    });
});

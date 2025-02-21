import { Test, TestingModule } from '@nestjs/testing';
import { PendingSongsController } from './pending.songs.controller';
import { PendingSongsService } from './pending.songs.service';
import { StreamableFile, ForbiddenException } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { JwtService } from '@nestjs/jwt';
import { Reflector } from '@nestjs/core';
import { RoleEnum } from '../role/role.enum';
import { RequestUser } from 'express';

describe('PendingSongsController', () => {
    let pendingSongsController: PendingSongsController;
    let pendingSongsService: PendingSongsService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [PendingSongsController],
            providers: [
                {
                    provide: PendingSongsService,
                    useValue: {
                        getAll: jest.fn().mockResolvedValue({ songs: [] }),
                        getAudioById: jest.fn().mockResolvedValue(new StreamableFile(Buffer.from('audio'))),
                        approveById: jest.fn().mockResolvedValue({ success: true }),
                        disapproveById: jest.fn().mockResolvedValue({ success: true }),
                    },
                },
                JwtService,
            ],
        }).compile();

        pendingSongsController = module.get<PendingSongsController>(PendingSongsController);
        pendingSongsService = module.get<PendingSongsService>(PendingSongsService);
    });

    it('should be defined', () => {
        expect(pendingSongsController).toBeDefined();
    });

    describe('getAll', () => {
        it('should return all pending songs for admin', async () => {
            const mockRequest = {
                token: { sub: 'mockedId', username: 'mockedUser', roles: [RoleEnum.Admin], hashedPassword: 'mocked-password' },
            } as RequestUser;
            const result = await pendingSongsController.getAll(mockRequest);
            expect(result).toEqual({ songs: [] });
            expect(pendingSongsService.getAll).toHaveBeenCalledWith(mockRequest);
        });
    });

    describe('getAudioById', () => {
        it('should return a StreamableFile for admin', async () => {
            const mockRequest = {
                token: { sub: 'mockedId', username: 'mockedUser', roles: [RoleEnum.Admin], hashedPassword: 'mocked-password' },
            } as RequestUser;
            const result = await pendingSongsController.getAudioById('1', mockRequest);
            expect(result).toBeInstanceOf(StreamableFile);
            expect(pendingSongsService.getAudioById).toHaveBeenCalledWith('1', mockRequest);
        });
    });

    describe('approveById', () => {
        it('should approve a song by ID for admin', async () => {
            const mockRequest = {
                token: { sub: 'mockedId', username: 'mockedUser', roles: [RoleEnum.Admin], hashedPassword: 'mocked-password' },
            } as RequestUser;
            const result = await pendingSongsController.approveById('1', mockRequest);
            expect(result).toEqual({ success: true });
            expect(pendingSongsService.approveById).toHaveBeenCalledWith('1', mockRequest);
        });
    });

    describe('disapproveById', () => {
        it('should disapprove a song by ID for admin', async () => {
            const mockRequest = {
                token: { sub: 'mockedId', username: 'mockedUser', roles: [RoleEnum.Admin], hashedPassword: 'mocked-password' },
            } as RequestUser;
            const result = await pendingSongsController.disapproveById('1', mockRequest);
            expect(result).toEqual({ success: true });
            expect(pendingSongsService.disapproveById).toHaveBeenCalledWith('1', mockRequest);
        });
    });
});

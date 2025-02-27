import { Test, TestingModule } from '@nestjs/testing';
import { Logger } from '@nestjs/common';
import { ViewService } from './view.service';
import { PrismaConfigService } from '../../config/prisma.config.service';
import { RequestUser } from 'express';
import { RoleEnum } from '../role/role.enum';

const mockPrismaService = {
    votingSession: {
        findFirst: jest.fn(),
    },
    pendingSong: {
        findMany: jest.fn(),
    },
};

describe('ViewService', () => {
    let service: ViewService;
    let prisma: PrismaConfigService;
    let loggerVerboseSpy: jest.SpyInstance;
    let loggerErrorSpy: jest.SpyInstance;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [ViewService, { provide: PrismaConfigService, useValue: mockPrismaService }],
        }).compile();

        service = module.get<ViewService>(ViewService);
        prisma = module.get<PrismaConfigService>(PrismaConfigService);

        loggerVerboseSpy = jest.spyOn(Logger.prototype, 'verbose').mockImplementation();
        loggerErrorSpy = jest.spyOn(Logger.prototype, 'error').mockImplementation();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('getSummaryOfVotesInSessionData', () => {
        it('should return summary of votes in session', async () => {
            const mockRequest = {
                token: { sub: 'mockedId', username: 'mockedUser', roles: [RoleEnum.Admin], hashedPassword: 'mocked-password' },
            } as RequestUser;

            const mockVotingSession = {
                id: 'mockedSessionId',
                songs: [
                    { id: 'song1', title: 'Song 1' },
                    { id: 'song2', title: 'Song 2' },
                ],
                Vote: [{ songId: 'song1' }, { songId: 'song1' }, { songId: 'song2' }],
            };

            mockPrismaService.votingSession.findFirst.mockResolvedValue(mockVotingSession);

            const result = await service.getSummaryOfVotesInSessionData(mockRequest);

            expect(result).toEqual({
                sessionId: 'mockedSessionId',
                songs: [
                    { songId: 'song1', songTitle: 'Song 1', voteCount: 2 },
                    { songId: 'song2', songTitle: 'Song 2', voteCount: 1 },
                ],
            });
            expect(prisma.votingSession.findFirst).toHaveBeenCalledWith({
                where: { start: { lte: expect.any(Date) }, end: { gte: expect.any(Date) } },
                include: { songs: true, Vote: true },
            });

            expect(loggerVerboseSpy).toHaveBeenCalled();
        });

        it('should throw error if no active voting session is found', async () => {
            const mockRequest = {
                token: { sub: 'mockedId', username: 'mockedUser', roles: [RoleEnum.Admin], hashedPassword: 'mocked-password' },
            } as RequestUser;

            mockPrismaService.votingSession.findFirst.mockResolvedValue(null);

            try {
                await service.getSummaryOfVotesInSessionData(mockRequest);
            } catch (error) {
                expect(error.message).toBe('No active voting session found');
            }

            expect(loggerVerboseSpy).toHaveBeenCalled();
            expect(loggerErrorSpy).toHaveBeenCalled();
        });
    });

    describe('getPendingSongsData', () => {
        it('should return pending songs data', async () => {
            const mockRequest = {
                token: { sub: 'mockedId', username: 'mockedUser', roles: [RoleEnum.Admin], hashedPassword: 'mocked-password' },
            } as RequestUser;

            const mockPendingSongs = [
                { id: 'song1', title: 'Song 1' },
                { id: 'song2', title: 'Song 2' },
            ];

            mockPrismaService.pendingSong.findMany.mockResolvedValue(mockPendingSongs);

            const result = await service.getPendingSongsData(mockRequest);

            expect(result).toEqual({ pendingSongs: mockPendingSongs });
            expect(prisma.pendingSong.findMany).toHaveBeenCalledWith({
                orderBy: { createdAt: 'desc' },
            });

            expect(loggerVerboseSpy).toHaveBeenCalled();
        });

        it('should throw error if no pending songs are found', async () => {
            const mockRequest = {
                token: { sub: 'mockedId', username: 'mockedUser', roles: [RoleEnum.Admin], hashedPassword: 'mocked-password' },
            } as RequestUser;

            mockPrismaService.pendingSong.findMany.mockResolvedValue([]);

            try {
                await service.getPendingSongsData(mockRequest);
            } catch (error) {
                expect(error.message).toBe('No pending songs found');
            }

            expect(loggerVerboseSpy).toHaveBeenCalled();
            expect(loggerErrorSpy).toHaveBeenCalled();
        });
    });
});

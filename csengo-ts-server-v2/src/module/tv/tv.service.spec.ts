import { Test, TestingModule } from '@nestjs/testing';
import { TvService } from './tv.service';
import { PrismaConfigService } from '../../config/prisma.config.service';
import { HttpException, HttpStatus, Logger } from '@nestjs/common';
import { RequestUser } from 'express';
import { RoleEnum } from '../role/role.enum';

describe('TvService', () => {
    let service: TvService;
    let prisma: PrismaConfigService;
    let loggerVerboseSpy: jest.SpyInstance;
    let loggerErrorSpy: jest.SpyInstance;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                TvService,
                {
                    provide: PrismaConfigService,
                    useValue: {
                        votingSession: {
                            findFirst: jest.fn(),
                        },
                    },
                },
            ],
        }).compile();

        service = module.get<TvService>(TvService);
        prisma = module.get<PrismaConfigService>(PrismaConfigService);

        loggerVerboseSpy = jest.spyOn(Logger.prototype, 'verbose').mockImplementation();
        loggerErrorSpy = jest.spyOn(Logger.prototype, 'error').mockImplementation();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    const mockRequest = {
        token: { sub: 'mockedId', username: 'mockedUser', roles: [RoleEnum.Admin], hashedPassword: 'mocked-password' },
    } as RequestUser;

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('getSummaryOfVotesInSession', () => {
        it('should return summary of votes when a session is active', async () => {
            prisma.votingSession.findFirst = jest.fn().mockResolvedValue({
                id: 1,
                start: new Date(),
                end: new Date(),
                songs: [
                    { id: 1, title: 'Song A' },
                    { id: 2, title: 'Song B' },
                ],
                Vote: [{ songId: 1 }, { songId: 1 }, { songId: 2 }],
            });

            const result = await service.getSummaryOfVotesInSession(mockRequest);
            expect(JSON.parse(result)).toEqual({
                sessionId: 1,
                songs: [
                    { songId: 1, songTitle: 'Song A', voteCount: 2 },
                    { songId: 2, songTitle: 'Song B', voteCount: 1 },
                ],
            });

            expect(loggerVerboseSpy).toHaveBeenCalled();
        });

        it('should throw NOT_FOUND if no active session exists', async () => {
            prisma.votingSession.findFirst = jest.fn().mockResolvedValue(null);

            await expect(service.getSummaryOfVotesInSession(mockRequest)).rejects.toThrow(
                new HttpException('No active voting session found', HttpStatus.NOT_FOUND),
            );

            expect(loggerErrorSpy).not.toHaveBeenCalled();
        });

        it('should throw INTERNAL_SERVER_ERROR if database query fails', async () => {
            prisma.votingSession.findFirst = jest.fn().mockRejectedValue(new Error('Database error'));

            await expect(service.getSummaryOfVotesInSession(mockRequest)).rejects.toThrow(
                new HttpException('Error fetching currently running voting session: Database error', HttpStatus.INTERNAL_SERVER_ERROR),
            );

            expect(loggerErrorSpy).toHaveBeenCalledWith(expect.stringContaining('Error fetching current voting session'));
        });

        it('should throw INTERNAL_SERVER_ERROR if vote counting fails', async () => {
            prisma.votingSession.findFirst = jest.fn().mockResolvedValue({
                id: 1,
                start: new Date(),
                end: new Date(),
                songs: [{ id: 1, title: 'Song A' }],
                Vote: null,
            });

            await expect(service.getSummaryOfVotesInSession(mockRequest)).rejects.toThrow(HttpException);
            await expect(service.getSummaryOfVotesInSession(mockRequest)).rejects.toThrow(
                expect.objectContaining({
                    message: expect.stringContaining('Error counting votes:'),
                    status: HttpStatus.INTERNAL_SERVER_ERROR,
                }),
            );

            expect(loggerErrorSpy).toHaveBeenCalledWith(expect.stringContaining('Error counting votes'));
        });
    });
});

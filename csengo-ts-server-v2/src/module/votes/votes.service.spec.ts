import { Test, TestingModule } from '@nestjs/testing';
import { VotesService } from './votes.service';
import { PrismaConfigService } from '../../config/prisma.config.service';
import { HttpException, HttpStatus, Logger } from '@nestjs/common';
import { RequestUser } from 'express';

// Mock data
const mockRequestUser = {
    token: {
        username: 'testUser',
        sub: '123',
    },
} as RequestUser;

const mockVotingSession = {
    id: '1',
    start: new Date(new Date().setFullYear(new Date().getFullYear() - 1)),
    end: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
    songs: [],
    Vote: [],
};

const mockVotes = [{ songId: '1' }, { songId: '2' }];

describe('VotesService', () => {
    let service: VotesService;
    let prisma: PrismaConfigService;
    let loggerVerboseSpy: jest.SpyInstance;
    let loggerErrorSpy: jest.SpyInstance;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                VotesService,
                {
                    provide: PrismaConfigService,
                    useValue: {
                        votingSession: {
                            findFirst: jest.fn(),
                        },
                        vote: {
                            findMany: jest.fn(),
                            findFirst: jest.fn(),
                            create: jest.fn(),
                            delete: jest.fn(),
                        },
                    },
                },
            ],
        }).compile();

        service = module.get<VotesService>(VotesService);
        prisma = module.get<PrismaConfigService>(PrismaConfigService);

        loggerVerboseSpy = jest.spyOn(Logger.prototype, 'verbose').mockImplementation();
        loggerErrorSpy = jest.spyOn(Logger.prototype, 'error').mockImplementation();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('getSummaryOfVotesInSession', () => {
        it('should return summary of votes in session', async () => {
            prisma.votingSession.findFirst = jest.fn().mockResolvedValue(mockVotingSession);

            const result = await service.getSummaryOfVotesInSession(mockRequestUser);
            expect(result).toEqual(
                JSON.stringify({
                    sessionId: mockVotingSession.id,
                    songs: [],
                }),
            );
            expect(loggerVerboseSpy).toHaveBeenCalled();
            expect(loggerErrorSpy).not.toHaveBeenCalled();
        });

        it('should throw an error when no active voting session is found', async () => {
            prisma.votingSession.findFirst = jest.fn().mockResolvedValue(null);

            await expect(service.getSummaryOfVotesInSession(mockRequestUser)).rejects.toThrow(
                new HttpException('No active voting session found', HttpStatus.NOT_FOUND),
            );
        });

        it('should throw an error when an internal error occurs', async () => {
            prisma.votingSession.findFirst = jest.fn().mockRejectedValue(new Error('Database error'));

            await expect(service.getSummaryOfVotesInSession(mockRequestUser)).rejects.toThrow(
                new HttpException('Error fetching currently running voting session: Database error', HttpStatus.INTERNAL_SERVER_ERROR),
            );
        });
    });

    describe('getVotedSongsByUserId', () => {
        it('should return voted songs by user id', async () => {
            prisma.votingSession.findFirst = jest.fn().mockResolvedValue(mockVotingSession);
            prisma.vote.findMany = jest.fn().mockResolvedValue(mockVotes);

            const result = await service.getVotedSongsByUserId(mockRequestUser);
            expect(result).toEqual(['1', '2']);
        });

        it('should throw an error when no votes are found', async () => {
            prisma.vote.findMany = jest.fn().mockResolvedValue([]);

            await expect(service.getVotedSongsByUserId(mockRequestUser)).rejects.toThrow(
                new HttpException('No active voting session found', HttpStatus.NOT_FOUND),
            );
        });

        it('should throw an error when an internal error occurs', async () => {
            prisma.votingSession.findFirst = jest.fn().mockResolvedValue(mockVotingSession);
            prisma.vote.findMany = jest.fn().mockRejectedValue(new Error('Database error'));

            await expect(service.getVotedSongsByUserId(mockRequestUser)).rejects.toThrow(
                new HttpException('Error fetching votes: Database error', HttpStatus.INTERNAL_SERVER_ERROR),
            );
        });
    });

    describe('voteUp', () => {
        it('should create a vote for a song', async () => {
            prisma.votingSession.findFirst = jest.fn().mockResolvedValue(mockVotingSession);
            prisma.vote.findFirst = jest.fn().mockResolvedValue(null);
            prisma.vote.create = jest.fn().mockResolvedValue({});

            const result = await service.voteUp('1', mockRequestUser);
            expect(result).toEqual(JSON.stringify({ message: 'Vote successfully created for song: 1' }));
        });

        it('should throw an error when user already voted for the song', async () => {
            prisma.votingSession.findFirst = jest.fn().mockResolvedValue(mockVotingSession);
            prisma.vote.findFirst = jest.fn().mockResolvedValue({});

            await expect(service.voteUp('1', mockRequestUser)).rejects.toThrow(new HttpException('User already voted for song: 1', HttpStatus.BAD_REQUEST));
        });

        it('should throw an error when an internal error occurs', async () => {
            prisma.votingSession.findFirst = jest.fn().mockResolvedValue(mockVotingSession);
            prisma.vote.findFirst = jest.fn().mockResolvedValue(null);
            prisma.vote.create = jest.fn().mockRejectedValue(new Error('Database error'));

            await expect(service.voteUp('1', mockRequestUser)).rejects.toThrow(
                new HttpException('Error creating vote: Database error', HttpStatus.INTERNAL_SERVER_ERROR),
            );
        });
    });

    describe('voteDown', () => {
        it('should delete a vote for a song', async () => {
            prisma.votingSession.findFirst = jest.fn().mockResolvedValue(mockVotingSession);
            prisma.vote.findFirst = jest.fn().mockResolvedValue({ id: '1' });
            prisma.vote.delete = jest.fn().mockResolvedValue({});

            const result = await service.voteDown('1', mockRequestUser);
            expect(result).toEqual(JSON.stringify({ message: 'Sucessfully deleted vote for song: 1' }));
        });

        it('should throw an error when no existing vote is found', async () => {
            prisma.votingSession.findFirst = jest.fn().mockResolvedValue(mockVotingSession);
            prisma.vote.findFirst = jest.fn().mockResolvedValue(null);

            await expect(service.voteDown('1', mockRequestUser)).rejects.toThrow(new HttpException('No existing vote found', HttpStatus.NOT_FOUND));
        });

        it('should throw an error when an internal error occurs', async () => {
            prisma.votingSession.findFirst = jest.fn().mockResolvedValue(mockVotingSession);
            prisma.vote.findFirst = jest.fn().mockResolvedValue(mockVotes);
            prisma.vote.delete = jest.fn().mockRejectedValue(new Error('Database error'));

            await expect(service.voteDown('1', mockRequestUser)).rejects.toThrow(
                new HttpException('Error deleting vote for vote down: Database error', HttpStatus.INTERNAL_SERVER_ERROR),
            );
        });
    });
});

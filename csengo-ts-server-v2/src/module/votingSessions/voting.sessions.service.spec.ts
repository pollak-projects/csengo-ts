import { Test, TestingModule } from '@nestjs/testing';
import { VotingSessionService } from './voting.sessions.service';
import { PrismaConfigService } from '../../config/prisma.config.service';
import { HttpException, HttpStatus, Logger } from "@nestjs/common";
import { RequestUser } from 'express';
import { SessionDto } from './dto/voting.session.dto';

// Mock data
const mockRequestUser = {
    token: {
        username: 'testUser',
        sub: '123',
    },
} as RequestUser;

const mockVotingSession = {
    id: '1',
    start: '2020-01-01',
    end: '2021-01-01',
    songs: [],
    Vote: [],
};

const mockSessions = [mockVotingSession];

describe('VotingSessionService', () => {
    let service: VotingSessionService;
    let prisma: PrismaConfigService;
    let loggerVerboseSpy: jest.SpyInstance;
    let loggerErrorSpy: jest.SpyInstance;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                VotingSessionService,
                {
                    provide: PrismaConfigService,
                    useValue: {
                        votingSession: {
                            findMany: jest.fn(),
                            findFirst: jest.fn(),
                            findUnique: jest.fn(),
                            create: jest.fn(),
                            update: jest.fn(),
                            delete: jest.fn(),
                        },
                        song: {
                            findMany: jest.fn(),
                        },
                    },
                },
            ],
        }).compile();

        service = module.get<VotingSessionService>(VotingSessionService);
        prisma = module.get<PrismaConfigService>(PrismaConfigService);

        loggerVerboseSpy = jest.spyOn(Logger.prototype, 'verbose').mockImplementation();
        loggerErrorSpy = jest.spyOn(Logger.prototype, 'error').mockImplementation();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('getAllSessions', () => {
        it('should return all sessions', async () => {
            prisma.votingSession.findMany = jest.fn().mockResolvedValue(mockSessions);

            const result = await service.getAllSessions(mockRequestUser);
            expect(result).toEqual(JSON.stringify(mockSessions));
            expect(loggerVerboseSpy).toHaveBeenCalled();
            expect(loggerErrorSpy).not.toHaveBeenCalled();
        });

        it('should throw an error when no sessions are found', async () => {
            prisma.votingSession.findMany = jest.fn().mockResolvedValue([]);

            await expect(service.getAllSessions(mockRequestUser)).rejects.toThrow(new HttpException('No sessions found', HttpStatus.NOT_FOUND));
        });

        it('should throw an error when an internal error occurs', async () => {
            prisma.votingSession.findMany = jest.fn().mockRejectedValue(new Error('Database error'));

            await expect(service.getAllSessions(mockRequestUser)).rejects.toThrow(
                new HttpException('Error fetching sessions: Database error', HttpStatus.INTERNAL_SERVER_ERROR),
            );
        });
    });

    describe('createSession', () => {
        const mockSessionDto: SessionDto = {
            start: '2020-01-01',
            end: '2021-01-01',
            songIds: ['1', '2'],
        };

        it('should create a new session', async () => {
            prisma.song.findMany = jest.fn().mockResolvedValue([{ title: 'Song 1' }, { title: 'Song 2' }]);
            prisma.votingSession.findFirst = jest.fn().mockResolvedValue(null);
            prisma.votingSession.create = jest.fn().mockResolvedValue(mockVotingSession);

            const result = await service.createSession(mockSessionDto, mockRequestUser);
            expect(result).toEqual(JSON.stringify({ message: `Successfully created new session: ${JSON.stringify(mockVotingSession)}` }));
        });

        it('should throw an error when start time is later than end time', async () => {
            const invalidSessionDto = { ...mockSessionDto, start: '2022-01-01', end: '2021-01-01' };

            await expect(service.createSession(invalidSessionDto, mockRequestUser)).rejects.toThrow(
                new HttpException('The start time cannot be later than the end time', HttpStatus.BAD_REQUEST),
            );
        });

        it('should throw an error when overlapping session is found', async () => {
            prisma.votingSession.findFirst = jest.fn().mockResolvedValue(mockVotingSession);

            await expect(service.createSession(mockSessionDto, mockRequestUser)).rejects.toThrow(
                new HttpException('The duration of the voting session overlaps with an existing voting session', HttpStatus.CONFLICT),
            );
        });

        it('should throw an error when an internal error occurs', async () => {
            prisma.song.findMany = jest.fn().mockResolvedValue([{ title: 'Song 1' }, { title: 'Song 2' }]);
            prisma.votingSession.findFirst = jest.fn().mockResolvedValue(null);
            prisma.votingSession.create = jest.fn().mockRejectedValue(new Error('Database error'));

            await expect(service.createSession(mockSessionDto, mockRequestUser)).rejects.toThrow(
                new HttpException('Error creating voting session: Database error', HttpStatus.INTERNAL_SERVER_ERROR),
            );
        });
    });

    describe('updateSessionById', () => {
        const mockSessionDto: SessionDto = {
            start: '2020-01-01',
            end: '2021-01-01',
            songIds: ['1', '2'],
        };

        it('should update a session by id', async () => {
            prisma.votingSession.findFirst = jest.fn().mockResolvedValue(null);
            prisma.song.findMany = jest.fn().mockResolvedValue([{ title: 'Song 1' }, { title: 'Song 2' }]);
            prisma.votingSession.update = jest.fn().mockResolvedValue(mockVotingSession);

            const result = await service.updateSessionById('1', mockSessionDto, mockRequestUser);
            expect(result).toEqual(JSON.stringify({ message: `Successfully updated session: ${JSON.stringify(mockVotingSession)}` }));
        });

        it('should throw an error when start time is later than end time', async () => {
            const invalidSessionDto = { ...mockSessionDto, start: '2022-01-01', end: '2021-01-01' };

            await expect(service.updateSessionById('1', invalidSessionDto, mockRequestUser)).rejects.toThrow(
                new HttpException('The start time cannot be later than the end time', HttpStatus.BAD_REQUEST),
            );
        });

        it('should throw an error when overlapping session is found', async () => {
            prisma.votingSession.findFirst = jest.fn().mockResolvedValue({ ...mockVotingSession, id: '2' });
            prisma.song.findMany = jest.fn().mockResolvedValue([{ title: 'Song 1' }, { title: 'Song 2' }]);

            await expect(service.updateSessionById('1', mockSessionDto, mockRequestUser)).rejects.toThrow(
                new HttpException('The duration of the voting session overlaps with an existing voting session', HttpStatus.CONFLICT),
            );
        });

        it('should throw an error when an internal error occurs', async () => {
            prisma.votingSession.findFirst = jest.fn().mockResolvedValue(null);
            prisma.song.findMany = jest.fn().mockResolvedValue([{ title: 'Song 1' }, { title: 'Song 2' }]);
            prisma.votingSession.update = jest.fn().mockRejectedValue(new Error('Database error'));

            await expect(service.updateSessionById('1', mockSessionDto, mockRequestUser)).rejects.toThrow(
                new HttpException('Error updating voting session: Database error', HttpStatus.INTERNAL_SERVER_ERROR),
            );
        });
    });

    describe('deleteSessionById', () => {
        it('should delete a session by id', async () => {
            prisma.votingSession.findUnique = jest.fn().mockResolvedValue(mockVotingSession);
            prisma.votingSession.delete = jest.fn().mockResolvedValue(mockVotingSession);

            const result = await service.deleteSessionById('1', mockRequestUser);
            expect(result).toEqual(JSON.stringify({ message: `Successfully deleted session: 1` }));
        });

        it('should throw an error when session is not found', async () => {
            prisma.votingSession.findUnique = jest.fn().mockResolvedValue(null);

            await expect(service.deleteSessionById('1', mockRequestUser)).rejects.toThrow(new HttpException('Voting session not found', HttpStatus.NOT_FOUND));
        });

        it('should throw an error when an internal error occurs', async () => {
            prisma.votingSession.findUnique = jest.fn().mockResolvedValue(mockVotingSession);
            prisma.votingSession.delete = jest.fn().mockRejectedValue(new Error('Database error'));

            await expect(service.deleteSessionById('1', mockRequestUser)).rejects.toThrow(
                new HttpException('Error deleting voting session: Database error', HttpStatus.INTERNAL_SERVER_ERROR),
            );
        });
    });
});
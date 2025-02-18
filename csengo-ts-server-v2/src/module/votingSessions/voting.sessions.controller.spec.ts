import { Test, TestingModule } from '@nestjs/testing';
import { VotingSessionController } from './voting.sessions.controller';
import { VotingSessionService } from './voting.sessions.service';
import { JwtService } from '@nestjs/jwt';
import { RequestUser } from 'express';
import { RoleEnum } from '../role/role.enum';
import { SessionDto } from './dto/voting.session.dto';

describe('VotingSessionController', () => {
    let controller: VotingSessionController;
    let service: VotingSessionService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [VotingSessionController],
            providers: [
                {
                    provide: VotingSessionService,
                    useValue: {
                        getAllSessions: jest.fn().mockResolvedValue({ sessions: [] }),
                        createSession: jest.fn().mockResolvedValue({ success: true }),
                        updateSessionById: jest.fn().mockResolvedValue({ success: true }),
                        deleteSessionById: jest.fn().mockResolvedValue({ success: true }),
                    },
                },
                JwtService,
            ],
        }).compile();

        controller = module.get<VotingSessionController>(VotingSessionController);
        service = module.get<VotingSessionService>(VotingSessionService);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    it('should return summary of votes in session', async () => {
        const mockRequest = {
            token: { sub: 'mockedId', username: 'mockedUser', roles: [RoleEnum.Admin], hashedPassword: 'mocked-password' },
        } as RequestUser;

        const result = await controller.getAllSessions(mockRequest);
        expect(result).toEqual({ sessions: [] });
        expect(service.getAllSessions).toHaveBeenCalledWith(mockRequest);
    });

    it('should return votes songs by user id', async () => {
        const mockRequest = {
            token: { sub: 'mockedId', username: 'mockedUser', roles: [RoleEnum.Admin], hashedPassword: 'mocked-password' },
        } as RequestUser;

        const mockSession = { songIds: ['1', '2'], start: '2020-01-01', end: '2021-01-01' } as SessionDto;

        const result = await controller.createSession(mockSession, mockRequest);
        expect(result).toEqual({ success: true });
        expect(service.createSession).toHaveBeenCalledWith(mockSession, mockRequest);
    });

    it('should return success when voted up', async () => {
        const mockRequest = {
            token: { sub: 'mockedId', username: 'mockedUser', roles: [RoleEnum.Admin], hashedPassword: 'mocked-password' },
        } as RequestUser;

        const mockSession = { songIds: ['1', '2'], start: '2020-01-01', end: '2021-01-01' } as SessionDto;

        const result = await controller.updateSessionById('1', mockSession, mockRequest);
        expect(result).toEqual({ success: true });
        expect(service.updateSessionById).toHaveBeenCalledWith('1', mockSession, mockRequest);
    });

    it('should return success when voted down', async () => {
        const mockRequest = {
            token: { sub: 'mockedId', username: 'mockedUser', roles: [RoleEnum.Admin], hashedPassword: 'mocked-password' },
        } as RequestUser;

        const result = await controller.deleteSessionById('1', mockRequest);
        expect(result).toEqual({ success: true });
        expect(service.deleteSessionById).toHaveBeenCalledWith('1', mockRequest);
    });
});

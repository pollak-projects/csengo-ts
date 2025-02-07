import { Test, TestingModule } from '@nestjs/testing';
import { VotesController } from './votes.controller';
import { VotesService } from './votes.service';
import { JwtService } from '@nestjs/jwt';
import { RequestUser } from 'express';
import { RoleEnum } from '../role/role.enum';

describe('VotesController', () => {
    let controller: VotesController;
    let service: VotesService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [VotesController],
            providers: [
                {
                    provide: VotesService,
                    useValue: {
                        getSummaryOfVotesInSession: jest.fn().mockResolvedValue({ votes: [] }),
                        getVotedSongsByUserId: jest.fn().mockResolvedValue({ songs: ['Song 1', 'Song 2'] }),
                        voteUp: jest.fn().mockResolvedValue({ success: true }),
                        voteDown: jest.fn().mockResolvedValue({ success: true }),
                    },
                },
                JwtService,
            ],
        }).compile();

        controller = module.get<VotesController>(VotesController);
        service = module.get<VotesService>(VotesService);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    it('should return summary of votes in session', async () => {
        const mockRequest = {
            token: { sub: 'mockedId', username: 'mockedUser', roles: [RoleEnum.Admin], hashedPassword: 'mocked-password' },
        } as RequestUser;

        const result = await controller.getSummrayOfVotesInSession(mockRequest);
        expect(result).toEqual({ votes: [] });
        expect(service.getSummaryOfVotesInSession).toHaveBeenCalledWith(mockRequest);
    });

    it('should return votes songs by user id', async () => {
        const mockRequest = {
            token: { sub: 'mockedId', username: 'mockedUser', roles: [RoleEnum.Admin], hashedPassword: 'mocked-password' },
        } as RequestUser;

        const result = await controller.getVotedSongsByUserId(mockRequest);
        expect(result).toEqual({ songs: ['Song 1', 'Song 2'] });
        expect(service.getVotedSongsByUserId).toHaveBeenCalledWith(mockRequest);
    });

    it('should return success when voted up', async () => {
        const mockRequest = {
            token: { sub: 'mockedId', username: 'mockedUser', roles: [RoleEnum.Admin], hashedPassword: 'mocked-password' },
        } as RequestUser;

        const result = await controller.voteUp('1', mockRequest);
        expect(result).toEqual({ success: true });
        expect(service.voteUp).toHaveBeenCalledWith('1', mockRequest);
    });

    it('should return success when voted down', async () => {
        const mockRequest = {
            token: { sub: 'mockedId', username: 'mockedUser', roles: [RoleEnum.Admin], hashedPassword: 'mocked-password' },
        } as RequestUser;

        const result = await controller.voteDown('1', mockRequest);
        expect(result).toEqual({ success: true });
        expect(service.voteDown).toHaveBeenCalledWith('1', mockRequest);
    });
});

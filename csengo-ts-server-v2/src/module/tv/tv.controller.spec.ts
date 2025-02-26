import { Test, TestingModule } from '@nestjs/testing';
import { TvController } from './tv.controller';
import { TvService } from './tv.service';
import { RequestUser } from 'express';
import { JwtService } from '@nestjs/jwt';
import { RoleEnum } from '../role/role.enum';
import { JwtPayload } from 'csengoJwt';

describe('TvController', () => {
    let controller: TvController;
    let service: TvService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [TvController],
            providers: [
                {
                    provide: TvService,
                    useValue: {
                        getSummaryOfVotesInSession: jest.fn().mockResolvedValue('Summary of votes'),
                    },
                },
                JwtService,
            ],
        }).compile();

        controller = module.get<TvController>(TvController);
        service = module.get<TvService>(TvService);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('getAll', () => {
        it('should return summary of votes in session', async () => {
            const mockRequest = {
                token: { sub: 'mockedId', username: 'mockedUser', roles: [RoleEnum.Admin], hashedPassword: 'mocked-password' },
            } as RequestUser;
            const result = await controller.getSummaryOfVotesInSession(mockRequest);
            expect(result).toEqual('Summary of votes');
            expect(service.getSummaryOfVotesInSession).toHaveBeenCalledWith(mockRequest);
        });
    });
});

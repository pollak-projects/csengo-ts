import { Test, TestingModule } from '@nestjs/testing';
import { ViewController } from './view.controller';
import { ViewService } from './view.service';
import { RequestUser } from 'express';
import { RoleEnum } from '../role/role.enum';

describe('ViewController', () => {
    let controller: ViewController;
    let service: ViewService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [ViewController],
            providers: [
                {
                    provide: ViewService,
                    useValue: {
                        getSummaryOfVotesInSessionData: jest.fn().mockResolvedValue('Rendered summary of votes'),
                        getPendingSongsData: jest.fn().mockResolvedValue('Rendered pending songs'),
                    },
                },
            ],
        }).compile();

        controller = module.get<ViewController>(ViewController);
        service = module.get<ViewService>(ViewService);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('renderSummaryOfVotesInSession', () => {
        it('should render summary of votes in session', async () => {
            const mockRequest = {
                token: { sub: 'mockedId', username: 'mockedUser', roles: [RoleEnum.Admin], hashedPassword: 'mocked-password' },
            } as RequestUser;

            const result = await controller.renderSummaryOfVotesInSession(mockRequest);

            expect(result).toEqual('Rendered summary of votes');
            expect(service.getSummaryOfVotesInSessionData).toHaveBeenCalledWith(mockRequest);
        });
    });

    describe('renderPendingSongs', () => {
        it('should render pending sons', async () => {
            const mockRequest = {
                token: { sub: 'mockedId', username: 'mockedUser', roles: [RoleEnum.Admin], hashedPassword: 'mocked-password' },
            } as RequestUser;

            const result = await controller.renderPendingSongs(mockRequest);

            expect(result).toEqual('Rendered pending songs');
            expect(service.getPendingSongsData).toHaveBeenCalledWith(mockRequest);
        });
    });
});

import { Test, TestingModule } from '@nestjs/testing';
import { Response } from 'express';
import { RequestUser } from 'express';
import { RoleEnum } from '../role/role.enum';
import { PrismaConfigService } from '../../config/prisma.config.service';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { SnipperController } from './snipper.controller';
import { SnipperService } from './snipper.service';
import { AddYoutubeSongDto } from './dto/add.song.dto';

describe('SnipperController', () => {
    let snipperController: SnipperController;
    let snipperService: SnipperService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [SnipperController],
            providers: [
                {
                    provide: SnipperService,
                    useValue: {
                        addSong: jest.fn().mockResolvedValue(''),
                    },
                },
                PrismaConfigService,
                ConfigService,
                JwtService,
            ],
        }).compile();

        snipperController = module.get<SnipperController>(SnipperController);
        snipperService = module.get<SnipperService>(SnipperService);
    });

    it('should be defined', () => {
        expect(snipperController).toBeDefined();
    });

    describe('addSong', () => {
        it('should return an empty response when song is successfully added', async () => {
            const mockRequest = {
                token: { sub: 'mockedId', username: 'mockedUser', roles: [RoleEnum.Admin], hashedPassword: 'mocked-password' },
            } as RequestUser;

            const mocRequestDto = {
                ytUrl: 'https://www.youtube.com/watch?v=8sgycukafqQ&list=RD6vNsAHxJXwE&index=3',
                from: 2,
                to: 10,
                title: 'alma',
            } as AddYoutubeSongDto;

            const result = await snipperController.addSong(mocRequestDto, mockRequest);
            expect(result).toEqual('');
            expect(snipperService.addSong).toHaveBeenCalledWith(mocRequestDto, mockRequest);
        });
    });
});

import { Test, TestingModule } from '@nestjs/testing';
import { SnipperService } from './snipper.service';
import { PrismaConfigService } from '../../config/prisma.config.service';
import { ConfigService } from '@nestjs/config';
import { HttpException, HttpStatus, Logger } from '@nestjs/common';
import { exec } from 'child_process';
import { AddYoutubeSongDto } from './dto/add.song.dto';
import { RequestUser } from 'express';
import { RoleEnum } from '../role/role.enum';

jest.mock('child_process', () => ({
    exec: jest.fn((command, callback) => {
        if (command.includes('yt-dlp -J')) {
            callback(null, JSON.stringify({ duration: 600, title: 'Test Video', creator: 'Test Creator' }), '');
        } else if (command.includes('yt-dlp -x --audio-format mp3')) {
            callback(null, '', '');
        } else if (command.includes('ffmpeg -i')) {
            callback(null, '', 'This is an stderr');
        } else {
            callback(new Error('Unknown command'), '', '');
        }
    }),
}));

jest.mock('process', () => ({
    cwd: jest.fn(() => '/mocked/cwd'),
}));

describe('SnipperService', () => {
    let service: SnipperService;
    let prisma: PrismaConfigService;
    let config: ConfigService;
    let loggerVerboseSpy: jest.SpyInstance;
    let loggerErrorSpy: jest.SpyInstance;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                SnipperService,
                {
                    provide: PrismaConfigService,
                    useValue: {
                        pendingSong: {
                            create: jest.fn(),
                        },
                    },
                },
                {
                    provide: ConfigService,
                    useValue: {
                        get: jest.fn(() => '/mocked-value'),
                    },
                },
            ],
        }).compile();

        service = module.get<SnipperService>(SnipperService);
        prisma = module.get<PrismaConfigService>(PrismaConfigService);
        config = module.get<ConfigService>(ConfigService);

        loggerVerboseSpy = jest.spyOn(Logger.prototype, 'verbose').mockImplementation();
        loggerErrorSpy = jest.spyOn(Logger.prototype, 'error').mockImplementation();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('addSong', () => {
        const songDto: AddYoutubeSongDto = {
            ytUrl: 'https://www.youtube.com/watch?v=JVpTp8IHdEg&list=RD6vNsAHxJXwE&index=10',
            from: 0,
            to: 10,
            title: 'Test Song',
        };

        const request = {
            token: {
                sub: 'mockedId',
                username: 'mockedUser',
                roles: [RoleEnum.Admin],
                hashedPassword: 'mocked-password',
            },
        } as RequestUser;

        it('should throw an error if time delta is less than 5 seconds', async () => {
            songDto.to = 4;
            await expect(service.addSong(songDto, request)).rejects.toThrow(
                new HttpException('From-to time delta cannot be greater than 15 seconds & cannot be less than 5', HttpStatus.BAD_REQUEST),
            );
        });

        it('should throw an error if time delta is greater than 15 seconds', async () => {
            songDto.to = 18;
            await expect(service.addSong(songDto, request)).rejects.toThrow(
                new HttpException('From-to time delta cannot be greater than 15 seconds & cannot be less than 5', HttpStatus.BAD_REQUEST),
            );
            songDto.to = 16;
        });

        it('should throw an error if yt-dlp fails to get video info', async () => {
            (exec as unknown as jest.Mock).mockImplementationOnce((cmd, callback) => {
                callback(new Error('yt-dlp error'), '', '');
            });
            await expect(service.addSong(songDto, request)).rejects.toThrow(
                new HttpException('Failed to get details about the youtube video', HttpStatus.INTERNAL_SERVER_ERROR),
            );
        });

        it('should throw an error if video duration is greater than 10 minutes', async () => {
            (exec as unknown as jest.Mock).mockImplementationOnce((cmd, callback) => {
                callback(null, JSON.stringify({ duration: 11 * 60 + 1 }), '');
            });
            await expect(service.addSong(songDto, request)).rejects.toThrow(
                new HttpException('The maximum length ot the video cannot be greater than 10 minutes', HttpStatus.BAD_REQUEST),
            );
        });

        it('should download and convert the video to mp3', async () => {
            prisma.pendingSong.create = jest.fn().mockResolvedValue({});

            await expect(service.addSong(songDto, request)).resolves.not.toThrow();
            expect(prisma.pendingSong.create).toHaveBeenCalled();
        });
    });
});

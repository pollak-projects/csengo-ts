import { Test, TestingModule } from '@nestjs/testing';
import { PrismaConfigService } from '../../config/prisma.config.service';
import { HttpException, HttpStatus, Logger } from '@nestjs/common';
import { RequestUser, Response } from 'express';
import { RoleEnum } from '../role/role.enum';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { RegisterDto } from './dto/register.dto';

describe('AuthService', () => {
    let service: AuthService;
    let prisma: PrismaConfigService;
    let jwtService: JwtService;
    let loggerVerboseSpy: jest.SpyInstance;
    let loggerErrorSpy: jest.SpyInstance;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AuthService,
                ConfigService,
                {
                    provide: PrismaConfigService,
                    useValue: {
                        user: {
                            findFirstOrThrow: jest.fn(),
                            findFirst: jest.fn(),
                            create: jest.fn(),
                        },
                        kreta: {
                            findFirstOrThrow: jest.fn(),
                        },
                    },
                },
                {
                    provide: JwtService,
                    useValue: {
                        signAsync: jest.fn().mockReturnValue('test-token'),
                    },
                },
            ],
        }).compile();

        service = module.get<AuthService>(AuthService);
        prisma = module.get<PrismaConfigService>(PrismaConfigService);
        jwtService = module.get<JwtService>(JwtService);

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

    describe('login', () => {
        it('should return JWT token upon successfull login', async () => {
            prisma.user.findFirstOrThrow = jest.fn().mockResolvedValue({
                id: 'mockedId',
                username: 'mockedUser',
                password: '$2y$10$sUoBoiNLULWPvFa007R/KuCOMt1bgCkYKsYtPz74uWjxJz92kUL5G',
                roles: [RoleEnum.Admin],
                kreta: {
                    om: '1234',
                },
            });

            const mockedLoginDto = { username: 'mocked-user', password: 'mocked-password' } as LoginDto;

            const mockResponse = {
                cookie: jest.fn(),
                status: jest.fn().mockReturnThis(),
                send: jest.fn(),
            } as unknown as Response;

            const result = await service.login(mockedLoginDto, mockResponse);
            expect(result).toEqual({ access_token: 'test-token' });

            expect(loggerVerboseSpy).toHaveBeenCalled();

            expect(prisma.user.findFirstOrThrow).toHaveBeenCalled();
        });

        it('should throw FORBIDDEN if invalid username or password', async () => {
            prisma.user.findFirstOrThrow = jest.fn().mockResolvedValue({
                id: 'mockedId',
                username: 'mockedUser',
                password: 'mocked-password',
                roles: [RoleEnum.Admin],
            });

            const mockedLoginDto = { username: 'mocked-user', password: 'mocked-password' } as LoginDto;

            await expect(service.login(mockedLoginDto, {} as Response)).rejects.toThrow(
                new HttpException('Invalid username or password', HttpStatus.FORBIDDEN),
            );

            expect(loggerVerboseSpy).toHaveBeenCalled();
            expect(loggerErrorSpy).toHaveBeenCalled();

            expect(prisma.user.findFirstOrThrow).toHaveBeenCalled();
        });

        it('should throw NOT_FOUND if user not found', async () => {
            prisma.user.findFirstOrThrow = jest.fn().mockRejectedValue(new Error('User not found'));

            const mockedLoginDto = { username: 'mocked-user', password: 'mocked-password' } as LoginDto;

            await expect(service.login(mockedLoginDto, {} as Response)).rejects.toThrow(
                new HttpException(`Failed to find user or invalid authentication data`, HttpStatus.NOT_FOUND),
            );

            expect(loggerVerboseSpy).toHaveBeenCalled();
            expect(loggerErrorSpy).toHaveBeenCalled();

            expect(prisma.user.findFirstOrThrow).toHaveBeenCalled();
        });
    });

    describe('register', () => {
        it('should return JWT token upon successful register', async () => {
            prisma.user.findFirst = jest.fn().mockResolvedValue(null);
            prisma.kreta.findFirstOrThrow = jest.fn().mockResolvedValue({ om: '72548167135' });
            prisma.user.create = jest.fn().mockResolvedValue({ id: 1, username: 'testuser', email: 'testuser@example.com', role: RoleEnum.User });

            const mockedRegisterDto = { username: 'new-user', password: 'new-password', email: 'new-email@test.com', om: '72548167135' } as RegisterDto;

            const mockResponse = {
                cookie: jest.fn(),
                status: jest.fn().mockReturnThis(),
                send: jest.fn(),
            } as unknown as Response;

            const result = await service.register(mockedRegisterDto, mockRequest, mockResponse);
            expect(result).toEqual({ access_token: 'test-token' });

            expect(loggerVerboseSpy).toHaveBeenCalled();

            expect(prisma.kreta.findFirstOrThrow).toHaveBeenCalled();
            expect(prisma.user.findFirst).toHaveBeenCalled();
            expect(prisma.user.create).toHaveBeenCalled();
        });

        it('should return INTERNAL_SERVER_ERROR if checking existing user fails', async () => {
            prisma.user.findFirst = jest.fn().mockRejectedValue(new Error('Database error'));

            const mockedRegisterDto = { username: 'new-user', password: 'new-password', email: 'new-email@test.com', om: '72548167135' } as RegisterDto;

            await expect(service.register(mockedRegisterDto, mockRequest, {} as Response)).rejects.toThrow(
                new HttpException(`Something went wrong`, HttpStatus.INTERNAL_SERVER_ERROR),
            );

            expect(loggerVerboseSpy).toHaveBeenCalled();
            expect(loggerErrorSpy).toHaveBeenCalled();

            expect(prisma.user.findFirst).toHaveBeenCalled();
        });

        it('should return INTERNAL_SERVER_ERROR if someone has already registered under those information', async () => {
            prisma.user.findFirst = jest.fn().mockResolvedValue({ id: 'existing-user-id' });

            const mockedRegisterDto = { username: 'existing-user', password: 'password', email: 'existing-email@test.com', om: '72548167135' } as RegisterDto;

            await expect(service.register(mockedRegisterDto, mockRequest, {} as Response)).rejects.toThrow(
                new HttpException(`Seems like someone has already registered under this information`, HttpStatus.INTERNAL_SERVER_ERROR),
            );

            expect(loggerVerboseSpy).toHaveBeenCalled();
            expect(loggerErrorSpy).toHaveBeenCalled();

            expect(prisma.user.findFirst).toHaveBeenCalled();
        });

        it('should return INTERNAL_SERVER_ERROR if prisma cannot find the OM in the database', async () => {
            prisma.user.findFirst = jest.fn().mockResolvedValue(null);
            prisma.kreta.findFirstOrThrow = jest.fn().mockRejectedValue(new Error('OM not found'));

            const mockedRegisterDto = { username: 'new-user', password: 'new-password', email: 'new-email@test.com', om: '72548167135' } as RegisterDto;

            await expect(service.register(mockedRegisterDto, mockRequest, {} as Response)).rejects.toThrow(
                new HttpException(`Can't find this OM id in the database`, HttpStatus.INTERNAL_SERVER_ERROR),
            );

            expect(loggerVerboseSpy).toHaveBeenCalled();
            expect(loggerErrorSpy).toHaveBeenCalled();

            expect(prisma.kreta.findFirstOrThrow).toHaveBeenCalled();
            expect(prisma.user.findFirst).toHaveBeenCalled();
        });

        it('should return INTERNAL_SERVER_ERROR if prisma fails to create user', async () => {
            prisma.user.findFirst = jest.fn().mockResolvedValue(null);
            prisma.kreta.findFirstOrThrow = jest.fn().mockResolvedValue({ om: '72548167135' });
            prisma.user.create = jest.fn().mockRejectedValue(new Error('Failed to create user'));

            const mockedRegisterDto = { username: 'new-user', password: 'new-password', email: 'new-email@test.com', om: '72578167135' } as RegisterDto;

            await expect(service.register(mockedRegisterDto, mockRequest, {} as Response)).rejects.toThrow(
                new HttpException(`Failed to register user bad OM`, HttpStatus.INTERNAL_SERVER_ERROR),
            );

            expect(loggerVerboseSpy).toHaveBeenCalled();
            expect(loggerErrorSpy).toHaveBeenCalled();

            expect(prisma.kreta.findFirstOrThrow).toHaveBeenCalled();
            expect(prisma.user.create).toHaveBeenCalled();
            expect(prisma.user.findFirst).toHaveBeenCalled();
        });
    });
});

import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { PrismaConfigService } from '../../config/prisma.config.service';
import { HttpException, HttpStatus, Logger } from '@nestjs/common';
import { RequestUser } from 'express';
import { RoleEnum } from '../role/role.enum';

describe('UserService', () => {
    let service: UserService;
    let prisma: PrismaConfigService;
    let loggerVerboseSpy: jest.SpyInstance;
    let loggerErrorSpy: jest.SpyInstance;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                UserService,
                {
                    provide: PrismaConfigService,
                    useValue: {
                        user: {
                            findUnique: jest.fn(),
                            findMany: jest.fn,
                            findFirstOrThrow: jest.fn(),
                            update: jest.fn(),
                        },
                    },
                },
            ],
        }).compile();

        service = module.get<UserService>(UserService);
        prisma = module.get<PrismaConfigService>(PrismaConfigService);

        loggerVerboseSpy = jest.spyOn(Logger.prototype, 'verbose').mockImplementation();
        loggerErrorSpy = jest.spyOn(Logger.prototype, 'error').mockImplementation();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    const mockRequestUser = {
        token: {
            username: 'testUser',
            sub: '123',
        },
    } as RequestUser;

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('getRealNameById', () => {
        it('should return real name when user is found', async () => {
            const mockUser = {
                kreta: {
                    name: 'John Doe',
                },
            };

            prisma.user.findUnique = jest.fn().mockResolvedValue(mockUser);

            const result = await service.getRealNameById(mockRequestUser);
            expect(result).toEqual({ realName: 'John Doe' });

            expect(loggerVerboseSpy).toHaveBeenCalled();
        });

        it('should throw an error when userId is missing', async () => {
            const requestUserWithoutId = { token: { username: 'testUser' } } as RequestUser;

            await expect(service.getRealNameById(requestUserWithoutId)).rejects.toThrow(new HttpException('Missing userId', HttpStatus.BAD_REQUEST));

            expect(loggerVerboseSpy).toHaveBeenCalled();
        });

        it('should throw an error when no user is found', async () => {
            prisma.user.findUnique = jest.fn().mockResolvedValue(null);

            await expect(service.getRealNameById(mockRequestUser)).rejects.toThrow(
                new HttpException("No real name found by this user's OM", HttpStatus.NO_CONTENT),
            );

            expect(loggerVerboseSpy).toHaveBeenCalled();
        });

        it('should throw an error when an internal error occurs', async () => {
            prisma.user.findUnique = jest.fn().mockRejectedValue(new Error('Database error'));

            await expect(service.getRealNameById(mockRequestUser)).rejects.toThrow(
                new HttpException('Error fetching real name of user: Database error', HttpStatus.INTERNAL_SERVER_ERROR),
            );

            expect(loggerVerboseSpy).toHaveBeenCalled();
            expect(loggerErrorSpy).toHaveBeenCalled();
        });
    });

    describe('getAll', () => {
        it('should return all users', async () => {
            const mockUsers = [
                {
                    id: '1',
                    username: 'user1',
                    email: 'user1@example.com',
                    roles: [{ role: 'admin' }],
                    kreta: { name: 'User One', om: '12345' },
                },
                {
                    id: '2',
                    username: 'user2',
                    email: 'user2@example.com',
                    roles: [{ role: 'user' }],
                    kreta: { name: 'User Two', om: '67890' },
                },
            ];

            prisma.user.findMany = jest.fn().mockResolvedValue(mockUsers);

            const result = await service.getAll(mockRequestUser);
            expect(result).toHaveLength(2);
            expect(result[0]).toEqual({
                id: '1',
                username: 'user1',
                email: 'user1@example.com',
                role: 'admin',
                kreta: { name: 'User One', om: '12345' },
            });

            expect(loggerVerboseSpy).toHaveBeenCalled();
        });

        it('should throw an error when no users are found', async () => {
            prisma.user.findMany = jest.fn().mockResolvedValue([]);

            await expect(service.getAll(mockRequestUser)).rejects.toThrow(new HttpException('No users found', HttpStatus.NO_CONTENT));

            expect(loggerVerboseSpy).toHaveBeenCalled();
        });

        it('should throw an error when an internal error occurs', async () => {
            prisma.user.findMany = jest.fn().mockRejectedValue(new Error('Database error'));

            await expect(service.getAll(mockRequestUser)).rejects.toThrow(
                new HttpException('Error fetching all users: Database error', HttpStatus.INTERNAL_SERVER_ERROR),
            );

            expect(loggerVerboseSpy).toHaveBeenCalled();
            expect(loggerErrorSpy).toHaveBeenCalled();
        });
    });

    describe('updateUserPassword', () => {
        it('should update user password', async () => {
            const mockUpdatePassDto = { userId: '123', password: 'newPassword123' };
            prisma.user.findFirstOrThrow = jest.fn().mockResolvedValue({ id: '123', username: 'testUser' });
            prisma.user.update = jest.fn().mockResolvedValue({ username: 'testUser' });

            const result = await service.updateUserPassword(mockRequestUser, mockUpdatePassDto);
            expect(result).toEqual({ message: 'Password updated for user: testUser' });

            expect(loggerVerboseSpy).toHaveBeenCalled();
        });

        it('should throw an error when user is not found', async () => {
            prisma.user.findFirstOrThrow = jest.fn().mockRejectedValue(new Error('User not found'));
            const mockUpdatePassDto = { userId: '123', password: 'newPassword123' };

            await expect(service.updateUserPassword(mockRequestUser, mockUpdatePassDto)).rejects.toThrow(
                new HttpException('User not found: User not found', HttpStatus.INTERNAL_SERVER_ERROR),
            );

            expect(loggerVerboseSpy).toHaveBeenCalled();
            expect(loggerErrorSpy).toHaveBeenCalled();
        });

        it('should throw an error when an internal error while findig user', async () => {
            prisma.user.findFirstOrThrow = jest.fn().mockRejectedValue(new Error('Database error'));
            const mockUpdatePassDto = { userId: '123', password: 'newPassword123' };

            await expect(service.updateUserPassword(mockRequestUser, mockUpdatePassDto)).rejects.toThrow(
                new HttpException('User not found: Database error', HttpStatus.INTERNAL_SERVER_ERROR),
            );

            expect(loggerVerboseSpy).toHaveBeenCalled();
            expect(loggerErrorSpy).toHaveBeenCalled();
        });
    });

    describe('updateUserRole', () => {
        it('should update user role', async () => {
            const mockUpdateRoleDto = { userId: '123', role: RoleEnum.Admin };
            prisma.user.findFirstOrThrow = jest.fn().mockResolvedValue({ roles: [{ role: 'user' }] });
            prisma.user.update = jest.fn().mockResolvedValue({ username: 'testUser' });

            const result = await service.updateUserRole(mockRequestUser, mockUpdateRoleDto);
            expect(result).toEqual({ message: 'Role updated for user: testUser' });

            expect(loggerVerboseSpy).toHaveBeenCalled();
        });

        it('should throw an error when user is not found', async () => {
            prisma.user.findFirstOrThrow = jest.fn().mockRejectedValue(new Error('User not found'));
            const mockUpdateRoleDto = { userId: '123', role: RoleEnum.Admin };

            await expect(service.updateUserRole(mockRequestUser, mockUpdateRoleDto)).rejects.toThrow(
                new HttpException('User not found: User not found', HttpStatus.INTERNAL_SERVER_ERROR),
            );

            expect(loggerVerboseSpy).toHaveBeenCalled();
            expect(loggerErrorSpy).toHaveBeenCalled();
        });

        it('should throw an error when an internal error while findig user', async () => {
            prisma.user.findFirstOrThrow = jest.fn().mockRejectedValue(new Error('Database error'));
            const mockUpdatePassDto = { userId: '123', password: 'newPassword123' };

            await expect(service.updateUserPassword(mockRequestUser, mockUpdatePassDto)).rejects.toThrow(
                new HttpException('User not found: Database error', HttpStatus.INTERNAL_SERVER_ERROR),
            );

            expect(loggerVerboseSpy).toHaveBeenCalled();
            expect(loggerErrorSpy).toHaveBeenCalled();
        });
    });
});

import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { AuthGuard } from '../auth/auth.guard';
import { JwtService } from '@nestjs/jwt';
import { RequestUser } from 'express';
import { JwtPayload } from 'csengoJwt';
import { RoleEnum } from '../role/role.enum';
import { UpdatePassDto } from './dto/update.pass.dto';
import { UpdateRoleDto } from './dto/update.role.dto';

describe('UserController', () => {
    let controller: UserController;
    let service: UserService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [UserController],
            providers: [
                {
                    provide: UserService,
                    useValue: {
                        getRealNameById: jest.fn().mockResolvedValue({ realName: 'mocked-name' }),
                        getAll: jest.fn().mockResolvedValue({ users: [] }),
                        updateUserPassword: jest.fn().mockResolvedValue({ success: true }),
                        updateUserRole: jest.fn().mockResolvedValue({ success: true }),
                    },
                },
                JwtService,
            ],
        }).compile();

        controller = module.get<UserController>(UserController);
        service = module.get<UserService>(UserService);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    it('should return real name', async () => {
        const mockRequest = {
            token: { sub: 'mockedId', username: 'mockedUser', roles: [RoleEnum.Admin], hashedPassword: 'mocked-password' },
        } as RequestUser;

        const result = await controller.getRealNameById(mockRequest);
        expect(result).toEqual({ realName: 'mocked-name' });
        expect(service.getRealNameById).toHaveBeenCalledWith(mockRequest);
    });

    it('should return all users', async () => {
        const mockRequest = {
            token: { sub: 'mockedId', username: 'mockedUser', roles: [RoleEnum.Admin], hashedPassword: 'mocked-password' },
        } as RequestUser;

        const result = await controller.getAll(mockRequest);
        expect(result).toEqual({ users: [] });
        expect(service.getAll).toHaveBeenCalledWith(mockRequest);
    });

    it('should return success when updating user password', async () => {
        const mockRequest = {
            token: { sub: 'mockedId', username: 'mockedUser', roles: [RoleEnum.Admin], hashedPassword: 'mocked-password' },
        } as RequestUser;

        const mockPassword = { userId: '1', password: 'asd' } as UpdatePassDto;

        const result = await controller.updateUserPassword(mockRequest, mockPassword);
        expect(result).toEqual({ success: true });
        expect(service.updateUserPassword).toHaveBeenCalledWith(mockRequest, mockPassword);
    });

    it('should return success when updating user role', async () => {
        const mockRequest = {
            token: { sub: 'mockedId', username: 'mockedUser', roles: [RoleEnum.Admin], hashedPassword: 'mocked-password' },
        } as RequestUser;

        const mockRole = { userId: '1', role: RoleEnum.Admin } as UpdateRoleDto;

        const result = await controller.updateUserRole(mockRequest, mockRole);
        expect(result).toEqual({ success: true });
        expect(service.updateUserRole).toHaveBeenCalledWith(mockRequest, mockRole);
    });
});

import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { Response } from 'express';
import { RequestUser } from 'express';
import { RoleEnum } from '../role/role.enum';

// Test suite
// The describe function is used to define a test suite.
// The first argument is the name of the test suite, and the second argument is a callback function that contains the test cases.
describe('AuthController', () => {
    let authController: AuthController;
    let authService: AuthService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [AuthController],
            providers: [
                {
                    provide: AuthService,
                    useValue: {
                        login: jest.fn().mockResolvedValue({ accessToken: 'mockedToken' }),
                        register: jest.fn().mockResolvedValue({ accessToken: 'mockedToken' }),
                    },
                },
            ],
        }).compile();

        authController = module.get<AuthController>(AuthController);
        authService = module.get<AuthService>(AuthService);
    });

    it('should be defined', () => {
        expect(authController).toBeDefined();
    });

    describe('login', () => {
        it('should return an access token', async () => {
            const loginDto: LoginDto = { username: 'testuser', password: 'testpassword' };

            const result = await authController.login(loginDto, {} as Response);
            expect(result).toEqual({ accessToken: 'mockedToken' });
            expect(authService.login).toHaveBeenCalledWith(loginDto, {} as Response);
        });
    });

    describe('register', () => {
        it('should register a user and return an access token', async () => {
            const mockRequest = {
                token: { sub: 'mockedId', username: 'mockedUser', roles: [RoleEnum.Admin], hashedPassword: 'mocked-password' },
            } as RequestUser;

            const registerDto: RegisterDto = {
                username: 'newuser',
                email: 'test@example.com',
                password: 'securepassword',
                om: '123456',
            };

            const result = await authController.register(registerDto, mockRequest, {} as Response);
            expect(result).toEqual({ accessToken: 'mockedToken' });
            expect(authService.register).toHaveBeenCalledWith(registerDto, mockRequest, {} as Response);
        });
    });
});

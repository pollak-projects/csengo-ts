import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { RequestUser, Response } from 'express';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { JwtPayload } from 'csengoJwt';
import * as process from 'node:process';
import { PrismaConfigService } from '../../config/prisma.config.service';
import { RoleEnum } from '../role/role.enum';
import { ConfigService } from '@nestjs/config';

/**
 * AuthService handles authentication-related operations such as login and registration.
 */
@Injectable()
export class AuthService {
    private readonly logger = new Logger(AuthService.name);

    /**
     * Constructs the AuthService.
     * @param {PrismaConfigService} prisma - The Prisma service for database operations.
     * @param {JwtService} jwtService - The JWT service for token operations.
     * @param {ConfigService} config - The configuration service.
     */
    constructor(
        private readonly prisma: PrismaConfigService,
        private readonly jwtService: JwtService,
        private readonly config: ConfigService,
    ) {}

    /**
     * Logs in a user.
     * @param {LoginDto} loginDto - The login data transfer object.
     * @param {Response} response - The response object to set cookies.
     * @returns {Promise<object>} The access token.
     * @throws {HttpException} If the user is not found or the password is invalid.
     */
    async login(loginDto: LoginDto, response: Response): Promise<object> {
        this.logger.verbose(`Login attempt by ${JSON.stringify(loginDto)}`);

        const user = await this.prisma.user
            .findFirstOrThrow({
                where: {
                    username: loginDto.username,
                },
                include: {
                    roles: true,
                    kreta: true,
                },
            })
            .catch((e) => {
                this.logger.error(`Failed to find user ${JSON.stringify(loginDto)}`, e);
                throw new HttpException(`Failed to find user or invalid authentication data`, HttpStatus.NOT_FOUND);
            });

        const passwordMatch = await bcrypt.compare(loginDto.password, user.password);
        if (!passwordMatch) {
            this.logger.error(`Invalid password for user ${JSON.stringify(loginDto)}`);
            throw new HttpException('Invalid username or password', HttpStatus.FORBIDDEN);
        }

        const payload: JwtPayload = {
            sub: user.id,
            username: user.username,
            hashedPassword: user.password,
            roles: user.roles.map((role) => role.role),
        };

        const token = await this.jwtService.signAsync(payload);

        response.cookie('token', token, {
            httpOnly: false,
            secure: !process.env.DEV,
            domain: process.env.CORS_DOMAIN,
            sameSite: 'none',
        });

        const userWithoutBigint = {
            ...user,
            kreta: {
                ...user.kreta,
                om: user.kreta.om.toString(),
            },
        };

        this.logger.verbose(`Successfully logged in user ${JSON.stringify(userWithoutBigint)}`);

        return { access_token: token };
    }

    /**
     * Registers a new user.
     * @param {RegisterDto} registerDto - The registration data transfer object.
     * @param {RequestUser} request - The request user object.
     * @param {Response} response - The response object to set cookies.
     * @returns {Promise<object>} The access token.
     * @throws {HttpException} If the user already exists or registration fails.
     */
    async register(registerDto: RegisterDto, request: RequestUser, response: Response): Promise<object> {
        this.logger.verbose(`Register attempt by ${JSON.stringify(registerDto)}`);

        const user = await this.prisma.user
            .findFirst({
                where: {
                    OR: [
                        {
                            username: registerDto.username,
                        },
                        {
                            kreta: {
                                om: BigInt(registerDto.om),
                            },
                        },
                    ],
                },
            })
            .catch((e) => {
                this.logger.error(`Something went wrong when checking the new users username and OM ${JSON.stringify(registerDto)}`, e);
                throw new HttpException(`Something went wrong`, HttpStatus.INTERNAL_SERVER_ERROR);
            });

        if (user) {
            this.logger.error(`User already registered ${JSON.stringify(registerDto)}`);
            throw new HttpException(`Seems like someone has already registered under this information`, HttpStatus.INTERNAL_SERVER_ERROR);
        }

        await this.prisma.kreta
            .findFirstOrThrow({
                where: {
                    om: BigInt(registerDto.om),
                },
            })
            .catch((e) => {
                this.logger.error(`Failed to register user ${JSON.stringify(registerDto)}`, e);
                throw new HttpException(`Can't find this OM id in the database`, HttpStatus.INTERNAL_SERVER_ERROR);
            });

        const hashedPassword = await bcrypt.hash(registerDto.password, 10);

        const newUser = await this.prisma.user
            .create({
                data: {
                    username: registerDto.username,
                    password: hashedPassword,
                    email: registerDto.email,
                    kreta: {
                        connect: {
                            om: BigInt(registerDto.om),
                        },
                    },
                    roles: {
                        connectOrCreate: {
                            where: {
                                role: RoleEnum.User,
                            },
                            create: {
                                role: RoleEnum.User,
                            },
                        },
                    },
                },
            })
            .catch((e) => {
                this.logger.error(`Failed to register user ${JSON.stringify(registerDto)}`, e);
                throw new HttpException(`Failed to register user bad OM`, HttpStatus.INTERNAL_SERVER_ERROR);
            });

        const payload: JwtPayload = {
            sub: newUser.id,
            username: newUser.username,
            hashedPassword: newUser.password,
            roles: [RoleEnum.User],
        };

        const token = await this.jwtService.signAsync(payload);

        response.cookie('token', token, {
            httpOnly: false,
            secure: !process.env.DEV,
            domain: process.env.CORS_DOMAIN,
            sameSite: 'none',
        });

        this.logger.verbose(`Successfully registered user ${JSON.stringify(newUser)}`);

        return { access_token: token };
    }

    /**
     * Registers a new user in development mode.
     * @param {RegisterDto} registerDto - The registration data transfer object.
     * @param {RequestUser} request - The request user object.
     * @param {Response} response - The response object to set cookies.
     * @returns {Promise<object>} The access token.
     * @throws {HttpException} If the environment is not development or registration fails.
     */
    async registerDev(registerDto: RegisterDto, request: RequestUser, response: Response): Promise<object> {
        this.logger.verbose(`Dev register attempt by ${JSON.stringify(registerDto)}`);

        if (this.config.get<string>('DEV') !== 'true') {
            this.logger.error(`Dev register attempt in non-dev environment`);
            throw new HttpException(`Dev register attempt in non-dev environment`, HttpStatus.INTERNAL_SERVER_ERROR);
        }

        const hashedPassword = await bcrypt.hash(registerDto.password, 10);

        const newUser = await this.prisma.user
            .create({
                data: {
                    username: registerDto.username,
                    password: hashedPassword,
                    email: registerDto.email,
                    kreta: {
                        create: {
                            name: registerDto.username,
                            om: BigInt(registerDto.om),
                        },
                    },
                },
            })
            .catch((e) => {
                this.logger.error(`Failed to register user ${JSON.stringify(registerDto)}`, e);
                throw new HttpException(`Failed to register user`, HttpStatus.INTERNAL_SERVER_ERROR);
            });

        this.logger.debug(`Registering with admin role`);
        const admin = await this.prisma.user
            .update({
                where: {
                    id: newUser.id,
                },
                data: {
                    roles: {
                        connectOrCreate: {
                            where: {
                                role: RoleEnum.Admin,
                            },
                            create: {
                                role: RoleEnum.Admin,
                            },
                        },
                    },
                },
                include: {
                    roles: true,
                },
            })
            .catch((e) => {
                this.logger.error(`Failed to add admin to user ${JSON.stringify(registerDto)}`, e);
                throw new HttpException(`Failed to add admin to user `, HttpStatus.INTERNAL_SERVER_ERROR);
            });

        const payload: JwtPayload = {
            sub: newUser.id,
            username: newUser.username,
            hashedPassword: newUser.password,
            roles: admin.roles.map((role) => role.role),
        };

        const token = await this.jwtService.signAsync(payload);

        response.cookie('token', token, {
            httpOnly: false,
            secure: !process.env.DEV,
            domain: process.env.CORS_DOMAIN,
            sameSite: 'none',
        });

        this.logger.verbose(`Successfully registered user ${JSON.stringify(newUser)}`);

        return { access_token: token };
    }
}

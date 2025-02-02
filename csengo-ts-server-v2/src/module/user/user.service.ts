import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { PrismaConfigService } from '../../config/prisma.config.service';
import { RequestUser } from 'express';
import { UpdatePassDto } from './dto/update.pass.dto';
import { UpdateRoleDto } from './dto/update.role.dto';
import * as bcrypt from 'bcryptjs';

/**
 * User service
 * This service is responsible for handling all the user related operations
 */
@Injectable()
export class UserService {
    private readonly logger = new Logger(UserService.name);

    constructor(private readonly prisma: PrismaConfigService) {}

    /**
     * Get real name by id
     * @param request - user request
     * @returns
     */
    async getRealNameById(request: RequestUser): Promise<object> {
        this.logger.verbose(`Fetching real name of user: ${JSON.stringify(request.token.username)}`);

        const userId = request.token.sub;

        if (!userId) throw new HttpException(`Missing userId`, HttpStatus.BAD_REQUEST);

        const user = await this.prisma.user
            .findUnique({
                where: { id: userId },
                select: {
                    kreta: {
                        select: { name: true },
                    },
                },
            })
            .catch((error) => {
                this.logger.error(`Error fetching real name user: ${JSON.stringify(request.token.username)}`);
                throw new HttpException(`Error fetching real name of user: ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
            });

        if (!user) throw new HttpException(`No real name found by this user's OM`, HttpStatus.NO_CONTENT);

        this.logger.verbose(`Successfully fecthed real name of user: ${JSON.stringify(request.token.username)}`);

        return { realName: user.kreta.name };
    }

    /**
     * Get all users
     *
     * @param request - user request
     * @returns
     */
    /**
     * Get all users
     * @param request - user request
     * @returns
     */
    async getAll(request: RequestUser): Promise<object> {
        this.logger.verbose(`Fetching all users by user: ${JSON.stringify(request.token.username)}`);

        const users = await this.prisma.user
            .findMany({
                select: {
                    id: true,
                    username: true,
                    email: true,
                    roles: {
                        select: {
                            role: true,
                        },
                    },
                    kreta: {
                        select: {
                            name: true,
                            om: true,
                        },
                    },
                },
            })
            .catch((error) => {
                this.logger.error(`Error fetching all users by user: ${JSON.stringify(request.token.username)}`);
                throw new HttpException(`Error fetching all users: ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
            });

        if (users.length === 0) throw new HttpException(`No users found`, HttpStatus.NO_CONTENT);

        this.logger.verbose(`Successfully fetched all users by user: ${JSON.stringify(request.token.username)}`);

        return users.map((user) => ({
            id: user.id,
            username: user.username,
            email: user.email,
            role: user.roles.length === 1 && user.roles[0].role === 'user' ? 'user' : user.roles.map((role) => role.role).filter((role) => role !== 'user')[0],
            kreta: {
                name: user.kreta.name,
                om: user.kreta.om.toString(),
            },
        }));
    }

    async updateUserPassword(request: RequestUser, updatePassDto: UpdatePassDto): Promise<object> {
        this.logger.verbose(`Updating password of user: ${JSON.stringify(updatePassDto.userId)} by user: ${JSON.stringify(request.token.username)}`);

        const user = await this.prisma.user
            .findFirstOrThrow({
                where: { id: updatePassDto.userId },
            })
            .catch((error) => {
                this.logger.error(`User not found by id: ${JSON.stringify(updatePassDto.userId)} requested by user: ${JSON.stringify(request.token.username)}`);
                throw new HttpException(`User not found: ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
            });

        if (!user) {
            this.logger.error(`User not found by id: ${JSON.stringify(updatePassDto.userId)} requested by user: ${JSON.stringify(request.token.username)}`);
            throw new HttpException(`User not found`, HttpStatus.NOT_FOUND);
        }

        const hashedPassword = await bcrypt.hash(updatePassDto.password, 10);

        const result = await this.prisma.user.update({
            where: {
                id: updatePassDto.userId,
            },
            data: {
                password: hashedPassword,
            },
        });

        this.logger.verbose(`User Password change request result: ${JSON.stringify(result)} by user: ${JSON.stringify(request.token.username)}`);
        this.logger.verbose(
            `Successfully updated password of user: ${JSON.stringify(updatePassDto.userId)} by user: ${JSON.stringify(request.token.username)}`,
        );

        return { message: `Password updated for user: ${result.username}` };
    }

    async updateUserRole(request: RequestUser, updateRoleDto: UpdateRoleDto): Promise<object> {
        this.logger.verbose(`Updating role of user: ${JSON.stringify(updateRoleDto.userId)} by user: ${JSON.stringify(request.token.username)}`);

        const user = await this.prisma.user
            .findFirstOrThrow({
                where: { id: updateRoleDto.userId },
                select: { roles: true },
            })
            .catch((error) => {
                this.logger.error(`User not found by id: ${JSON.stringify(updateRoleDto.userId)} requested by user: ${JSON.stringify(request.token.username)}`);
                throw new HttpException(`User not found: ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
            });

        if (!user) {
            this.logger.error(`User not found by id: ${JSON.stringify(updateRoleDto.userId)} requested by user: ${JSON.stringify(request.token.username)}`);
            throw new HttpException(`User not found`, HttpStatus.NOT_FOUND);
        }

        const result = await this.prisma.user.update({
            where: {
                id: updateRoleDto.userId,
            },
            data: {
                roles: {
                    disconnect: user.roles.filter((role) => role.role !== updateRoleDto.role && role.role !== 'user').map((role) => ({ role: role.role })),
                    connectOrCreate: {
                        where: {
                            role: updateRoleDto.role,
                        },
                        create: {
                            role: updateRoleDto.role,
                        },
                    },
                },
            },
            include: {
                roles: true,
            },
        });

        this.logger.verbose(`User Role change request result: ${JSON.stringify(result)} by user: ${JSON.stringify(request.token.username)}`);
        this.logger.verbose(`Successfully updated role of user: ${JSON.stringify(updateRoleDto.userId)} by user: ${JSON.stringify(request.token.username)}`);

        return { message: `Role updated for user: ${result.username}` };
    }
}

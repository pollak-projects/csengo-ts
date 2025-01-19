import { CanActivate, ExecutionContext, HttpException, Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { RequestUser } from 'express';
import * as process from 'node:process';
import { Reflector } from '@nestjs/core';

/**
 * AuthGuard is a guard that implements the CanActivate interface.
 * It is used to protect routes by verifying JWT tokens.
 */
@Injectable()
export class AuthGuard implements CanActivate {
    private readonly logger = new Logger(AuthGuard.name);

    /**
     * Constructor for AuthGuard.
     * @param jwtService - The JWT service used for token operations.
     * @param reflector - The reflector used to get metadata.
     */
    constructor(
        private readonly jwtService: JwtService,
        private readonly reflector: Reflector,
    ) {}

    /**
     * Determines if the request can proceed based on the presence and validity of a JWT token.
     * @param context - The execution context of the request.
     * @returns A promise that resolves to a boolean indicating if the request can proceed.
     * @throws UnauthorizedException if the token is missing or invalid.
     * @throws HttpException if the token is invalid.
     */
    async canActivate(context: ExecutionContext): Promise<boolean> {
        const isPublic = this.reflector.getAllAndOverride<boolean>('isPublic', [context.getHandler(), context.getClass()]);

        if (isPublic) {
            this.logger.debug('Public endpoint');
            const request: RequestUser = context.switchToHttp().getRequest();
            if (request.cookies['token']) {
                const token = request.cookies['token'];
                this.logger.verbose(`Checking token ${JSON.stringify(this.jwtService.decode(token))}`);
                request.token = await this.jwtService.verifyAsync(token, {
                    secret: process.env.JWT_SECRET,
                });
            }
            return true;
        }

        const request: RequestUser = context.switchToHttp().getRequest();
        const token = request.cookies['token'];
        this.logger.verbose(`Checking token ${JSON.stringify(this.jwtService.decode(token))}`);
        if (!token) {
            throw new UnauthorizedException();
        }
        try {
            request.token = await this.jwtService.verifyAsync(token, {
                secret: process.env.JWT_SECRET,
            });
            return true;
        } catch {
            throw new HttpException('Invalid token', 401);
        }
    }
}

import { Injectable, CanActivate, ExecutionContext, Logger } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RoleEnum } from './role.enum';
import { ROLES_KEY } from './role.decorator';
import { RequestUser } from 'express';

/**
 * Roles guard
 */
@Injectable()
export class RolesGuard implements CanActivate {
    private readonly logger = new Logger(RolesGuard.name);
    constructor(private readonly reflector: Reflector) {}

    /**
     * @param context - execution context
     * @returns
     */
    canActivate(context: ExecutionContext): boolean {
        const requiredRoles = this.reflector.getAllAndOverride<RoleEnum[]>(ROLES_KEY, [context.getHandler(), context.getClass()]);
        this.logger.verbose(`Required roles: ${requiredRoles} for ${context.getHandler().name}`);
        if (!requiredRoles || (requiredRoles.length === 1 && requiredRoles[0] === 'user')) {
            this.logger.verbose(`No roles required for ${context.getHandler().name}`);
            return true;
        }
        const request: RequestUser = context.switchToHttp().getRequest();
        this.logger.verbose(`Checking roles ${JSON.stringify(request.token.roles)} for ${context.getHandler().name}`);
        this.logger.verbose(`Check roles result ${requiredRoles.some((role) => request.token.roles?.includes(role))} for ${context.getHandler().name}`);
        return requiredRoles.some((role) => request.token.roles?.includes(role));
    }
}

import { ExecutionContext, Logger } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolesGuard } from './role.guard';
import { RoleEnum } from './role.enum';

describe('RolesGuard', () => {
    let rolesGuard: RolesGuard;
    let reflector: Reflector;
    let loggerVerboseSpy: jest.SpyInstance;
    let loggerErrorSpy: jest.SpyInstance;

    beforeEach(() => {
        reflector = new Reflector();
        rolesGuard = new RolesGuard(reflector);

        loggerVerboseSpy = jest.spyOn(Logger.prototype, 'verbose').mockImplementation();
        loggerErrorSpy = jest.spyOn(Logger.prototype, 'error').mockImplementation();
    });

    it('should be defined', () => {
        expect(rolesGuard).toBeDefined();
    });

    it('should allow access if no roles are required', () => {
        const context = {
            switchToHttp: () => ({
                getRequest: () => ({ token: { roles: [] } }),
            }),
            getHandler: () => ({ name: 'Handler' }),
            getClass: () => {},
        } as ExecutionContext;

        jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(undefined);

        const result = rolesGuard.canActivate(context);
        expect(result).toBe(true);
        expect(loggerVerboseSpy).toHaveBeenCalled();
        expect(loggerErrorSpy).not.toHaveBeenCalled();
    });

    it('should allow access if user has required roles', () => {
        const context = {
            switchToHttp: () => ({
                getRequest: () => ({ token: { roles: [RoleEnum.Admin] } }),
            }),
            getHandler: () => ({ name: 'Handler' }),
            getClass: () => {},
        } as ExecutionContext;

        jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([RoleEnum.Admin]);

        const result = rolesGuard.canActivate(context);
        expect(result).toBe(true);
    });

    it('should deny access if user does not have required roles', () => {
        const context = {
            switchToHttp: () => ({
                getRequest: () => ({ token: { roles: [RoleEnum.User] } }),
            }),
            getHandler: () => ({ name: 'Handler' }),
            getClass: () => {},
        } as ExecutionContext;

        jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([RoleEnum.Admin]);

        const result = rolesGuard.canActivate(context);
        expect(result).toBe(false);
    });
});

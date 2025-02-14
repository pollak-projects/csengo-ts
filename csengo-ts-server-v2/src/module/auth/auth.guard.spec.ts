import { ExecutionContext, HttpException, Logger, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from './auth.guard';

describe('AuthGuard', () => {
    let authGuard: AuthGuard;
    let jwtService: JwtService;
    let reflector: Reflector;
    let loggerVerboseSpy: jest.SpyInstance;
    let loggerErrorSpy: jest.SpyInstance;
    let loggerDebugSpy: jest.SpyInstance;

    beforeEach(() => {
        jwtService = new JwtService({});
        reflector = new Reflector();
        authGuard = new AuthGuard(jwtService, reflector);

        loggerVerboseSpy = jest.spyOn(Logger.prototype, 'verbose').mockImplementation();
        loggerErrorSpy = jest.spyOn(Logger.prototype, 'error').mockImplementation();
        loggerDebugSpy = jest.spyOn(Logger.prototype, 'debug').mockImplementation();
    });

    it('should be defined', () => {
        expect(authGuard).toBeDefined();
    });

    it('should allow access to public endpoints', async () => {
        const context = {
            switchToHttp: () => ({
                getRequest: () => ({ cookies: {} }),
            }),
            getHandler: () => {},
            getClass: () => {},
        } as ExecutionContext;

        jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(true);

        const result = await authGuard.canActivate(context);
        expect(result).toBe(true);
        expect(loggerDebugSpy).toHaveBeenCalled();
        expect(loggerVerboseSpy).not.toHaveBeenCalled();
        expect(loggerErrorSpy).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException if token is missing', async () => {
        const context = {
            switchToHttp: () => ({
                getRequest: () => ({ cookies: {} }),
            }),
            getHandler: () => {},
            getClass: () => {},
        } as ExecutionContext;

        jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false);

        await expect(authGuard.canActivate(context)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw HttpException if token is invalid', async () => {
        const context = {
            switchToHttp: () => ({
                getRequest: () => ({ cookies: { token: 'invalid-token' } }),
            }),
            getHandler: () => {},
            getClass: () => {},
        } as ExecutionContext;

        jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false);
        jest.spyOn(jwtService, 'verifyAsync').mockRejectedValue(new Error('Invalid token'));

        await expect(authGuard.canActivate(context)).rejects.toThrow(HttpException);
    });

    it('should allow access if token is valid', async () => {
        const context = {
            switchToHttp: () => ({
                getRequest: () => ({ cookies: { token: 'valid-token' }, token: {} }),
            }),
            getHandler: () => {},
            getClass: () => {},
        } as ExecutionContext;

        jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false);
        jest.spyOn(jwtService, 'verifyAsync').mockResolvedValue({ username: 'testuser' });

        const result = await authGuard.canActivate(context);
        expect(result).toBe(true);
    });
});

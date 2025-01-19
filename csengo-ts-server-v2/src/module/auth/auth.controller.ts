import { Body, Controller, HttpCode, HttpStatus, Post, Req, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { RequestUser, Response } from 'express';

@Controller()
/// The AuthController class is a controller that handles requests related to authentication.
/// The @Controller() decorator is used to define the controller.
export class AuthController {
    constructor(private readonly appService: AuthService) {}

    /// The login method is a POST endpoint that handles user login requests.
    @Post('login')
    @HttpCode(HttpStatus.OK)
    async login(@Body() userBody: LoginDto, @Res({ passthrough: true }) response: Response): Promise<object> {
        return this.appService.login(userBody, response);
    }

    /// The register method is a POST endpoint that handles user registration requests.
    @Post('register')
    @HttpCode(HttpStatus.OK)
    async register(@Body() userBody: RegisterDto, @Req() request: RequestUser, @Res({ passthrough: true }) response: Response): Promise<object> {
        return this.appService.register(userBody, request, response);
    }

    /// The registerDev method is a POST endpoint that handles developer registration requests.
    /// Only for developers.
    @Post('register-dev')
    @HttpCode(HttpStatus.OK)
    async registerDev(@Body() userBody: RegisterDto, @Req() request: RequestUser, @Res({ passthrough: true }) response: Response): Promise<object> {
        return this.appService.registerDev(userBody, request, response);
    }
}

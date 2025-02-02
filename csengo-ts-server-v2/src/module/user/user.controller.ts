import { Body, Controller, Get, HttpCode, HttpStatus, Put, Req, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { RequestUser } from 'express';
import { AuthGuard } from '../auth/auth.guard';
import { Roles } from '../role/role.decorator';
import { RoleEnum } from '../role/role.enum';
import { UpdatePassDto } from './dto/update.pass.dto';
import { UpdateRoleDto } from './dto/update.role.dto';
import { RolesGuard } from '../role/role.guard';

@UseGuards(AuthGuard, RolesGuard)
@Controller()
export class UserController {
    constructor(private readonly appService: UserService) {}

    @Get('real-name')
    @HttpCode(HttpStatus.OK)
    async getRealNameById(@Req() request: RequestUser): Promise<object> {
        return this.appService.getRealNameById(request);
    }

    @Roles(RoleEnum.Admin)
    @Get()
    @HttpCode(HttpStatus.OK)
    async getAll(@Req() request: RequestUser): Promise<object> {
        return this.appService.getAll(request);
    }

    @Roles(RoleEnum.Admin)
    @Put()
    @HttpCode(HttpStatus.OK)
    async updateUserPassword(@Req() request: RequestUser, @Body() body: UpdatePassDto): Promise<object> {
        return this.appService.updateUserPassword(request, body);
    }

    @Roles(RoleEnum.Admin)
    @Put('roles')
    @HttpCode(HttpStatus.OK)
    async updateUserRole(@Req() request: RequestUser, @Body() body: UpdateRoleDto): Promise<object> {
        return this.appService.updateUserRole(request, body);
    }
}

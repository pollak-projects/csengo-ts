import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Post, Put, Query, Req, UseGuards } from '@nestjs/common';
import { VotingSessionService } from './voting.sessions.service';
import { RequestUser } from 'express';
import { SessionDto } from './dto/voting.session.dto';
import { AuthGuard } from '../auth/auth.guard';
import { RoleEnum } from '../role/role.enum';
import { Roles } from '../role/role.decorator';
import { RolesGuard } from '../role/role.guard';

@Roles(RoleEnum.Admin)
@UseGuards(AuthGuard, RolesGuard)
@Controller()
export class VotingSessionController {
    constructor(private readonly appService: VotingSessionService) {}

    @Get()
    @HttpCode(HttpStatus.OK)
    async getAllSessions(@Req() request: RequestUser): Promise<string> {
        return this.appService.getAllSessions(request);
    }

    @Post()
    @HttpCode(HttpStatus.OK)
    async createSession(@Body() sessionBody: SessionDto, @Req() request: RequestUser): Promise<string> {
        return this.appService.createSession(sessionBody, request);
    }

    @Put()
    @HttpCode(HttpStatus.OK)
    async updateSessionById(@Query('id') id: string, @Body() sessionBody: SessionDto, @Req() request: RequestUser): Promise<string> {
        return this.appService.updateSessionById(id, sessionBody, request);
    }

    @Delete()
    @HttpCode(HttpStatus.OK)
    async deleteSessionById(@Query('id') id: string, @Req() request: RequestUser): Promise<string> {
        return this.appService.deleteSessionById(id, request);
    }
}

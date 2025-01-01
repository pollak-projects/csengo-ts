import { Controller, Delete, Get, HttpCode, HttpStatus, Post, Query, Req, UseGuards } from '@nestjs/common';
import { VotesService } from './votes.service';
import { RequestUser } from 'express';
import { AuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../role/role.guard';

@UseGuards(AuthGuard, RolesGuard)
@Controller()
export class VotesController {
    constructor(private readonly appService: VotesService) {}

    @Get('session')
    @HttpCode(HttpStatus.OK)
    async getSummrayOfVotesInSession(@Req() request: RequestUser): Promise<string> {
        return this.appService.getSummaryOfVotesInSession(request);
    }

    @Get('current-user')
    @HttpCode(HttpStatus.OK)
    async getVotedSongsByUserId(@Req() request: RequestUser): Promise<string[]> {
        return this.appService.getVotedSongsByUserId(request);
    }

    @Post()
    @HttpCode(HttpStatus.OK)
    async voteUp(@Query('id') id: string, @Req() request: RequestUser): Promise<string> {
        return this.appService.voteUp(id, request);
    }

    @Delete()
    @HttpCode(HttpStatus.OK)
    async voteDown(@Query('id') id: string, @Req() request: RequestUser): Promise<string> {
        return this.appService.voteDown(id, request);
    }
}

import { Controller, Delete, Get, HttpCode, HttpStatus, Post, Query, Req, StreamableFile, UseGuards } from '@nestjs/common';
import { PendingSongsService } from './pending.songs.service';
import { RequestUser } from 'express';
import { AuthGuard } from '../auth/auth.guard';
import { RoleEnum } from '../role/role.enum';
import { Roles } from '../role/role.decorator';
import { RolesGuard } from '../role/role.guard';

/**
 * Pending songs controller
 */
@UseGuards(AuthGuard, RolesGuard)
@Roles(RoleEnum.Admin)
@Controller()
export class PendingSongsController {
    constructor(private readonly appService: PendingSongsService) {}

    @Get()
    @HttpCode(HttpStatus.OK)
    async getAll(@Req() request: RequestUser): Promise<object> {
        return this.appService.getAll(request);
    }

    @Get('audio')
    @HttpCode(HttpStatus.OK)
    async getAudioById(@Query('id') id: string, @Req() request: RequestUser): Promise<StreamableFile> {
        return this.appService.getAudioById(id, request);
    }

    @Post()
    @HttpCode(HttpStatus.OK)
    async approveById(@Query('id') id: string, @Req() request: RequestUser): Promise<object> {
        return this.appService.approveById(id, request);
    }

    @Delete()
    @HttpCode(HttpStatus.OK)
    async disapproveById(@Query('id') id: string, @Req() request: RequestUser): Promise<object> {
        return this.appService.disapproveById(id, request);
    }
}

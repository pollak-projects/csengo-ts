import { Body, Controller, HttpCode, HttpStatus, Post, Req, UseGuards } from '@nestjs/common';
import { SnipperService } from './snipper.service';
import { RequestUser } from 'express';
import { AuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../role/role.guard';
import { AddYoutubeSongDto } from './dto/add.song.dto';

@UseGuards(AuthGuard, RolesGuard)
@Controller()
export class SnipperController {
    constructor(private readonly appService: SnipperService) {}

    @Post()
    @HttpCode(HttpStatus.OK)
    async addSong(@Body() contents: AddYoutubeSongDto, @Req() request: RequestUser): Promise<void> {
        return this.appService.addSong(contents, request);
    }
}

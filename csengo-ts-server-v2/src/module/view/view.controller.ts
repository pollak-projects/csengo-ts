import { Controller, Get, HttpCode, HttpStatus, Render, Req } from '@nestjs/common';
import { ViewService } from './view.service';
import { RequestUser } from 'express';

@Controller()
export class ViewController {
    constructor(private readonly appService: ViewService) {}

    @Get('tv')
    @Render('tv')
    @HttpCode(HttpStatus.OK)
    async renderSummaryOfVotesInSession(@Req() request: RequestUser): Promise<object> {
        return this.appService.getSummaryOfVotesInSessionData(request);
    }

    @Get('pending-songs')
    @Render('pending-songs')
    @HttpCode(HttpStatus.OK)
    async renderPendingSongs(@Req() request: RequestUser): Promise<object> {
        return this.appService.getPendingSongsData(request);
    }
}

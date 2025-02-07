import { Controller, Get, HttpCode, HttpStatus, Req } from '@nestjs/common';
import { TvService } from './tv.service';
import { RequestUser } from 'express';

// @UseGuards(AuthGuard, RolesGuard)
/**
 * TV controller
 */
@Controller()
export class TvController {
    constructor(private readonly appService: TvService) {}

    @Get('session')
    // @Roles(RoleEnum.Admin)
    @HttpCode(HttpStatus.OK)
    async getSummaryOfVotesInSession(@Req() request: RequestUser): Promise<string> {
        return this.appService.getSummaryOfVotesInSession(request);
    }
}

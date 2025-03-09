import {
    Body,
    Controller,
    Delete,
    FileTypeValidator,
    Get,
    HttpCode,
    HttpStatus,
    Logger,
    ParseFilePipe,
    Post,
    Put,
    Query,
    Req,
    Res,
    StreamableFile,
    UploadedFile,
    UseFilters,
    UseGuards,
    UseInterceptors,
} from '@nestjs/common';
import { RequestUser, Response } from 'express';
import { SongsService } from './songs.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { CreateSongDto } from './dto/create.song.dto';
import { Prisma } from '@prisma/client';
import { PrismaConfigService } from '../../config/prisma.config.service';
import { AuthGuard } from '../auth/auth.guard';
import { Roles } from '../role/role.decorator';
import { RoleEnum } from '../role/role.enum';
import { AudioLengthValidatorPipe } from '../../pipe/audio.length.validation.pipe.service';
import { DeleteFileOnErrorFilter } from '../../filter/delete.file.on.error.filter';
import { ConfigService } from '@nestjs/config';
import { Public } from '../auth/auth.decorator';
import { RolesGuard } from '../role/role.guard';

@UseGuards(AuthGuard, RolesGuard)
@Controller()
export class SongsController {
    private readonly logger = new Logger(SongsController.name);

    constructor(
        private readonly appService: SongsService,
        private readonly prisma: PrismaConfigService,
        private readonly configService: ConfigService,
    ) {}

    @Public()
    @Get('session/audio')
    @HttpCode(HttpStatus.OK)
    async getAllAudioInSession(@Req() request: RequestUser, @Res({ passthrough: false }) response: Response): Promise<Response> {
        return this.appService.getAllAudioInSession(request, response);
    }

    @Get('session')
    @HttpCode(HttpStatus.OK)
    async getAllInSession(@Req() request: RequestUser): Promise<object> {
        return this.appService.getAllInSession(request);
    }

    @Get()
    @Roles(RoleEnum.Admin)
    @HttpCode(HttpStatus.OK)
    async getAll(@Req() request: RequestUser): Promise<object> {
        return this.appService.getAll(request);
    }

    @Get('winner')
    @HttpCode(HttpStatus.OK)
    async getWinner(@Req() request: RequestUser): Promise<object> {
        return this.appService.getWinner(request);
    }

    @Public()
    @Get('winner/audio')
    @HttpCode(HttpStatus.OK)
    async getWinnerAudio(@Req() request: RequestUser): Promise<StreamableFile> {
        return this.appService.getWinnerAudio(request);
    }

    @Get('audio')
    @HttpCode(HttpStatus.OK)
    async getAudioById(@Query('id') id: string, @Req() request: RequestUser): Promise<StreamableFile> {
        return this.appService.getAudioById(id, request);
    }

    @Post('audio')
    @HttpCode(HttpStatus.OK)
    @UseFilters(DeleteFileOnErrorFilter)
    @UseInterceptors(FileInterceptor('file'))
    async upload(
        @Body() createSongDto: CreateSongDto,
        @Req() request: RequestUser,
        @UploadedFile(
            new ParseFilePipe({
                validators: [new FileTypeValidator({ fileType: 'audio/mpeg' }), new AudioLengthValidatorPipe({ length: 15 })],
            }),
        )
        file: Express.Multer.File,
    ): Promise<Prisma.Args<typeof this.prisma.pendingSong, 'create'>['data']> {
        this.logger.debug(`File uploaded successfully: ${JSON.stringify(file)}, ${JSON.stringify(request.token)}`);
        return this.appService.upload(createSongDto, request, file);
    }

    @Post('audio/direct')
    @Roles(RoleEnum.Admin)
    @HttpCode(HttpStatus.OK)
    @UseFilters(DeleteFileOnErrorFilter)
    @UseInterceptors(FileInterceptor('file'))
    async uploadDirect(
        @Body() createSongDto: CreateSongDto,
        @Req() request: RequestUser,
        @UploadedFile(
            new ParseFilePipe({
                validators: [new FileTypeValidator({ fileType: 'audio/mpeg' })],
            }),
        )
        file: Express.Multer.File,
    ): Promise<object> {
        return this.appService.uploadDirect(createSongDto, request, file);
    }

    @Put()
    @Roles(RoleEnum.Admin)
    @HttpCode(HttpStatus.OK)
    async renameById(@Query('id') id: string, @Query('name') name: string, @Req() request: RequestUser): Promise<object> {
        return this.appService.renameById(id, name, request);
    }

    @Delete()
    @Roles(RoleEnum.Admin)
    @HttpCode(HttpStatus.OK)
    async deleteById(@Query('id') id: string, @Req() request: RequestUser): Promise<object> {
        return this.appService.deleteById(id, request);
    }
}

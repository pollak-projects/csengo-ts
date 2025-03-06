import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { PrismaConfigService } from '../../config/prisma.config.service';
import { RequestUser } from 'express';
import { exec } from 'child_process';
import { AddYoutubeSongDto } from './dto/add.song.dto';
import { ConfigService } from '@nestjs/config';
import { cwd } from 'process';
import { join } from 'path';

@Injectable()
export class SnipperService {
    private readonly logger = new Logger(SnipperService.name);

    constructor(
        private readonly prisma: PrismaConfigService,
        private readonly config: ConfigService,
    ) {}

    async addSong(songDto: AddYoutubeSongDto, request: RequestUser): Promise<void> {
        this.logger.verbose(`User ${JSON.stringify(request.token.username)} snipping video ${songDto.ytUrl}`);

        // Delta Criteria
        // delta > 5s
        // delta < 15s
        const delta = songDto.to - songDto.from;
        this.logger.verbose(`Time delta given by user: ${delta}`);
        if (delta < 5 || delta > 16) {
            throw new HttpException(`From-to time delta cannot be greater than 15 seconds & cannot be less than 5`, HttpStatus.BAD_REQUEST);
        }

        // Get duration from youtube in a promise
        this.logger.verbose('Requesting duration from youtube');
        const video = await new Promise<object>((resolve, reject) => {
            exec(`yt-dlp -J ${songDto.ytUrl}`, (error, stdout, stderr) => {
                if (error) {
                    this.logger.error(`Failed to get info about the video ${error.message}`);
                    return reject(new HttpException(`Failed to get details about the youtube video`, HttpStatus.INTERNAL_SERVER_ERROR));
                }
                if (stderr) {
                    this.logger.error(`Failed to get info about the video ${stderr}`);
                    return reject(new HttpException(`Failed to get details about the youtube video`, HttpStatus.INTERNAL_SERVER_ERROR));
                }

                resolve(JSON.parse(stdout));
            });
        });

        // Check parsing
        if (video === null) {
            throw new HttpException('Failed to parse details about the video', HttpStatus.INTERNAL_SERVER_ERROR);
        } else {
            this.logger.verbose(
                `Received data about youtube video Title: ${video['title']} (by channel: ${video['creator']}) duration: ${video['duration']} url: ${songDto.ytUrl}`,
            );
        }

        // Check for max duration
        if (video['duration'] > 11 * 60) {
            throw new HttpException('The maximum length ot the video cannot be greater than 10 minutes', HttpStatus.BAD_REQUEST);
        }

        const temp_path = this.config.get('UPLOAD_TEMP_PATH')!;
        // Download the m4a file and convert it to mp3 with a random uuid name
        this.logger.verbose('Downloading the video from youtube and converting to mp3');
        const original = await new Promise<string>((resolve, reject) => {
            const id = crypto.randomUUID();
            exec(`yt-dlp -x --audio-format mp3 ${songDto.ytUrl} -o "${temp_path}/${id}.%(ext)s" --force-overwrites`, (error, stdout, stderr) => {
                if (stderr) {
                    this.logger.error(`Failed to download/convert music: ${error?.message}`);
                    return reject(new HttpException(`Failed to download video`, HttpStatus.INTERNAL_SERVER_ERROR));
                }
                resolve(id);
            });
        });

        // Cut out the part the user wants
        this.logger.verbose(`Using ffmpeg to cut out from ${songDto.from}-${songDto.to}`);
        const cut_name = `${Date.now()}-${video['title']}.mp3`;
        await new Promise<void>((resolve) => {
            const command = `ffmpeg -i ${temp_path}/${original}.mp3 -ss ${songDto.from} -t ${songDto.to - songDto.from} -acodec copy "${this.config.get('UPLOAD_PATH')!}/${cut_name}" -nostdin`;
            exec(command, (error, stdout, stderr) => {
                if (stderr) {
                    this.logger.verbose(`stderr of ffmpeg (might not be an error): ${stderr}`);
                    resolve();
                }
            });
        });

        // Add to the pending songs
        await this.prisma.pendingSong
            .create({
                data: {
                    title: songDto.title,
                    uploadedBy: {
                        connect: {
                            id: request.token.sub,
                        },
                    },
                    songBucket: {
                        create: {
                            path: join(cwd(), this.config.get('UPLOAD_PATH')!) + '/' + cut_name,
                        },
                    },
                },
            })
            .catch((error) => {
                this.logger.error(`Error uploading song into pending songs by user: ${JSON.stringify(request.token.username)}`);
                throw new HttpException(`Error uploading song into pending songs: ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
            })
            .then(() => {
                this.logger.verbose('Song has been added to the dabatase');
            });
    }
}

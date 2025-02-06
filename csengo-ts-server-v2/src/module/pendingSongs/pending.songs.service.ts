import { HttpException, HttpStatus, Injectable, Logger, StreamableFile } from '@nestjs/common';
import { PrismaConfigService } from '../../config/prisma.config.service';
import { RequestUser } from 'express';
import { rimraf } from 'rimraf';
import { createReadStream } from 'fs';

/**
 * Pending songs service
 * This service is responsible for handling all the pending songs related operations
 */
@Injectable()
export class PendingSongsService {
    private readonly logger = new Logger(PendingSongsService.name);

    constructor(private readonly prisma: PrismaConfigService) {}

    /**
     * Get all pending songs
     * @param request - user request
     * @returns
     */
    async getAll(request: RequestUser): Promise<object> {
        this.logger.verbose(`Fetching pending songs for user: ${JSON.stringify(request.token.username)}`);

        const pendingSongs = await this.prisma.pendingSong
            .findMany({
                orderBy: { createdAt: 'desc' },
                include: {
                    uploadedBy: {
                        select: {
                            kreta: {
                                select: {
                                    name: true,
                                },
                            },
                        },
                    },
                },
            })
            .catch((error) => {
                this.logger.error(`Error fetching pending songs for user: ${JSON.stringify(request.token.username)}`);
                throw new HttpException(`Error fetching pending songs: ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
            });

        if (pendingSongs.length === 0) throw new HttpException(`No pending songs found`, HttpStatus.NOT_FOUND);

        this.logger.verbose(`Pending songs successfully fetched for user: ${JSON.stringify(request.token.username)}`);

        return pendingSongs;
    }

    /**
     * Get audio by id
     * @param id - id of the song
     * @param request - user request
     */
    async getAudioById(id: string, request: RequestUser): Promise<StreamableFile> {
        this.logger.verbose(`Fetching audio for song: ${id} by user: ${JSON.stringify(request.token.username)}`);

        if (!id) throw new HttpException(`Missing required fields`, HttpStatus.BAD_REQUEST);

        const song = await this.prisma.pendingSong
            .findUnique({
                where: {
                    id: id,
                },
                include: {
                    songBucket: true,
                },
            })
            .catch((error) => {
                this.logger.error(`Error fetched audio for song: ${id} by user: ${JSON.stringify(request.token.username)}`);
                throw new HttpException(`Error fetching song: ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
            });

        if (!song) {
            throw new HttpException('Song not found', HttpStatus.NOT_FOUND);
        }

        this.logger.verbose(`Successfully fetched audio for song: ${id} by user: ${JSON.stringify(request.token.username)}`);

        try {
            const audioFile = createReadStream(song.songBucket.path);

            await new Promise<void>((resolve, reject) => {
                audioFile.on('error', (error) => {
                    this.logger.error(`File not found for song: ${id} at path: ${song.songBucket.path}`);
                    reject(new HttpException(`File not found: ${error.message}`, HttpStatus.NOT_FOUND));
                });
                audioFile.on('open', () => resolve());
            });

            const file = new StreamableFile(audioFile, {
                type: 'audio/mpeg',
            });

            this.logger.verbose(`Successfully created streamable file for song: ${id} by user: ${JSON.stringify(request.token.username)}`);

            return file;
        } catch (e) {
            this.logger.error(`Error creating streamable file for song: ${id} by user: ${JSON.stringify(request.token.username)}`);
            throw e;
        }
    }

    /**
     * Approve pending song by id
     * @param id - id of the song
     * @param request - user request
     * @returns object
     */
    async approveById(id: string, request: RequestUser): Promise<object> {
        this.logger.verbose(`Approving song with id: ${id} by user: ${JSON.stringify(request.token.username)}`);

        const pendingSong = await this.prisma.pendingSong
            .findUnique({
                where: { id },
            })
            .catch((error) => {
                this.logger.error(`Error fetched pending song with id: ${id} by user: ${JSON.stringify(request.token.username)}`);
                throw new HttpException(`Error fetching pending song: ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
            });

        if (!pendingSong) {
            throw new HttpException('Pending song not found', HttpStatus.NOT_FOUND);
        }

        const newSong = await this.prisma.song
            .create({
                data: {
                    title: pendingSong.title,
                    uploadedBy: {
                        connect: {
                            id: pendingSong.uploadedById,
                        },
                    },
                    songBucket: {
                        connect: {
                            id: pendingSong.songBucketId,
                        },
                    },
                },
            })
            .catch((error) => {
                this.logger.error(`Error creating new song record from pending song with id: ${id} by user: ${JSON.stringify(request.token.username)}`);
                throw new HttpException(`Error creating song: ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
            });

        this.logger.verbose(`Successfully created new song from pending song with id: ${newSong.id} by user: ${JSON.stringify(request.token.username)}`);

        await this.prisma.pendingSong
            .delete({
                where: { id },
            })
            .catch((error) => {
                this.logger.error(`Error deleting remained pending song record with id: ${id} by user: ${JSON.stringify(request.token.username)}`);
                throw new HttpException(`Error deleting unused pending song: ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
            });

        this.logger.verbose(`Successfully deleted remained pending song record with id: ${newSong.id} by user: ${JSON.stringify(request.token.username)}`);

        return { message: `Peding song with id ${id} sucessfully approved` };
    }

    /**
     * Disapprove pending song by id
     * @param id - id of the song
     * @param request - user request
     * @returns object
     */
    async disapproveById(id: string, request: RequestUser): Promise<object> {
        this.logger.verbose(`Disapproving pending song with id: ${id} by user: ${JSON.stringify(request.token.username)}`);

        if (!id) throw new HttpException(`Missing required fields`, HttpStatus.BAD_REQUEST);

        const pendingSong = await this.prisma.pendingSong
            .findFirstOrThrow({
                where: { id },
                include: {
                    songBucket: {
                        select: {
                            path: true,
                        },
                    },
                },
            })
            .catch((error) => {
                this.logger.error(`Error fetching pending song record with id: ${id} by user: ${JSON.stringify(request.token.username)}`);
                throw new HttpException(`Error fetching pending song: ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
            });

        rimraf(pendingSong.songBucket.path).catch((error) => {
            this.logger.error(`Error deleting pending song file with pending song id: ${id} by user: ${JSON.stringify(request.token.username)}`);
            throw new HttpException(`Error deleting song file: ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
        });

        const deletedSong = await this.prisma.pendingSong
            .delete({
                where: { id },
            })
            .catch((error) => {
                this.logger.error(`Error deleting pending song record with id: ${id} by user: ${JSON.stringify(request.token.username)}`);
                throw new HttpException(`Error deleting pending song: ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
            });

        this.logger.verbose(`Successfully disapproved pending ${deletedSong.title} song with id: ${id} by user: ${JSON.stringify(request.token.username)}`);

        return { message: `Peding song with id ${id} sucessfully disapproved` };
    }
}

import { HttpException, HttpStatus, Injectable, Logger, StreamableFile } from '@nestjs/common';
import { PrismaConfigService } from '../../config/prisma.config.service';
import { RequestUser, Response } from 'express';
import { CreateSongDto } from './dto/create.song.dto';
import { createReadStream } from 'fs';
import { rimraf } from 'rimraf';
import { Prisma } from '@prisma/client';
import * as archiver from 'archiver';

/**
 * Songs service
 */
@Injectable()
export class SongsService {
    private readonly logger = new Logger(SongsService.name);

    constructor(
        private readonly prisma: PrismaConfigService,
    ) {}

    /**
     * Get all audio in session
     * @param request -
     * @param response -
     */
    async getAllAudioInSession(request: RequestUser, response: Response): Promise<Response> {
        this.logger.verbose(`Downloading songs in session for user: ${JSON.stringify(request.token?.username)}`);

        const currentDateTime = new Date();

        const votingSession = await this.prisma.votingSession
            .findFirst({
                where: {
                    start: {
                        lte: currentDateTime,
                    },
                    end: {
                        gte: currentDateTime,
                    },
                },
                include: {
                    songs: {
                        include: {
                            songBucket: {
                                select: {
                                    path: true,
                                },
                            },
                        },
                    },
                },
            })
            .catch((error) => {
                this.logger.error(`Error downloading current voting session for user: ${JSON.stringify(request.token?.username)}`);
                throw new HttpException(`Error downloading session: ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
            });

        if (!votingSession) {
            throw new HttpException('No active voting session found', HttpStatus.NOT_FOUND);
        }

        try {
            const archive = archiver('zip', {
                zlib: { level: 9 }, // Sets the compression level.
            });

            response.attachment('songs.zip');
            archive.pipe(response);

            votingSession.songs.forEach((song) => {
                this.logger.verbose(`Adding song: ${JSON.stringify(song)} to the zip file`);
                archive.file(song.songBucket.path, { name: `${song.title!}.mp3` });
            });

            await archive.finalize();
            return response;
        } catch (error) {
            this.logger.error(`Error mapping songs in session for user: ${JSON.stringify(request.token?.username)}`, error);
            throw new HttpException(`Error during mapping the songs: ${error}`, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Get all audio from session
     * @param {RequestUser} request -
     */
    async getAllInSession(request: RequestUser): Promise<object> {
        this.logger.verbose(`Fetching songs in session for user: ${JSON.stringify(request.token.username)}`);

        const currentDateTime = new Date();

        const votingSession = await this.prisma.votingSession
            .findFirst({
                where: {
                    start: {
                        lte: currentDateTime,
                    },
                    end: {
                        gte: currentDateTime,
                    },
                },
                include: {
                    songs: {
                        include: {
                            songBucket: {
                                select: {
                                    path: true,
                                },
                            },
                        },
                    },
                },
            })
            .catch((error) => {
                this.logger.error(`Error fetching current voting session for user: ${JSON.stringify(request.token.username)}`);
                throw new HttpException(`Error fetching session: ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
            });

        if (!votingSession) {
            throw new HttpException('No active voting session found', HttpStatus.NOT_FOUND);
        }

        try {
            const songList = votingSession.songs.map((song) => ({
                songId: song.id,
                songTitle: song.title,
            }));

            this.logger.verbose(`Successfully fetched songs in session for user: ${JSON.stringify(request.token.username)}`);

            return {
                sessionId: votingSession.id,
                songs: songList,
            };
        } catch (error) {
            this.logger.error(`Error mapping songs in session for user: ${JSON.stringify(request.token.username)}`);
            throw new HttpException(`Error during mapping the songs: ${error}`, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Get all songs
     * @param request -
     * @returns
     */
    async getAll(request: RequestUser): Promise<object> {
        this.logger.verbose(`Fetching all songs for user: ${request.token.username} for user: ${JSON.stringify(request.token.username)}`);

        const songs = await this.prisma.song
            .findMany({
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
                    songBucket: {
                        select: {
                            path: true,
                        },
                    },
                },
            })
            .catch((error) => {
                this.logger.error(`Error fetching songs for user: ${JSON.stringify(request.token.username)}`);
                throw new HttpException(`Error fetching songs: ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
            });

        if (songs.length === 0) throw new HttpException(`No songs found`, HttpStatus.NOT_FOUND);

        this.logger.verbose(`Successfully fetched all songs for user: ${JSON.stringify(request.token.username)}`);

        const songsList = songs.map((song) => ({
            id: song.id,
            title: song.title,
            createdAt: song.createdAt,
            updatedAt: song.updatedAt,
            uploadedBy: song.uploadedBy,
        }));

        return songsList;
    }

    async getWinner(request: RequestUser): Promise<object> {
        return this.getWinnerObject(request);
    }

    async getWinnerAudio(request: RequestUser): Promise<StreamableFile> {
        this.logger.verbose(`Fetching winner song audio for user: ${JSON.stringify(request.token?.username)}`);
        const winnerSong: any = await this.getWinnerObject(request);

        try {
            const audioFile = createReadStream(winnerSong.songBucket.path);

            await new Promise<void>((resolve, reject) => {
                audioFile.on('error', (error) => {
                    this.logger.error(`File not found for song: ${winnerSong.id} at path: ${winnerSong.songBucket.path}`);
                    reject(new HttpException(`File not found: ${error.message}`, HttpStatus.NOT_FOUND));
                });
                audioFile.on('open', () => resolve());
            });

            const file = new StreamableFile(audioFile, {
                type: 'audio/mpeg',
            });

            return file;
        } catch (e) {
            this.logger.error(`Error creating streamable file for song: ${winnerSong.id} by user: ${JSON.stringify(request.token?.username)}`);
            throw new HttpException(`Error creating streamable file: ${e}`, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Get audio by id
     * @param id -
     * @param request -
     */
    async getAudioById(id: string, request: RequestUser): Promise<StreamableFile> {
        this.logger.verbose(`Fetching audio with song id: ${id} for user: ${JSON.stringify(request.token.username)}`);

        if (!id) throw new HttpException(`Missing required fields`, HttpStatus.BAD_REQUEST);

        const song = await this.prisma.song
            .findUnique({
                where: {
                    id: id,
                },
                include: {
                    songBucket: true,
                },
            })
            .catch((error) => {
                this.logger.error(`Error fetching song with id: ${id} for user: ${JSON.stringify(request.token.username)}`);
                throw new HttpException(`Error fetching song: ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
            });

        if (!song) {
            throw new HttpException('Song not found', HttpStatus.NOT_FOUND);
        }

        this.logger.verbose(`Successfully fetched audio with song id: ${id} for user: ${JSON.stringify(request.token.username)}`);

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

    async upload(
        createSongDto: CreateSongDto,
        request: RequestUser,
        file: Express.Multer.File,
    ): Promise<Prisma.Args<typeof this.prisma.pendingSong, 'create'>['data']> {
        this.logger.verbose(`Uploading song into pending songs by user: ${JSON.stringify(request.token.username)}`);

        const newFile = await this.prisma.pendingSong
            .create({
                data: {
                    title: createSongDto.title,
                    uploadedBy: {
                        connect: {
                            id: request.token.sub,
                        },
                    },
                    songBucket: {
                        create: {
                            path: file.path,
                        },
                    },
                },
            })
            .catch((error) => {
                this.logger.error(`Error uploading song into pending songs by user: ${JSON.stringify(request.token.username)}`);
                throw new HttpException(`Error uploading song into pending songs: ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
            });

        this.logger.verbose(`Successfully uploaded song into pending songs by user: ${JSON.stringify(request.token.username)}`);

        return newFile;
    }

    async uploadDirect(createSongDto: CreateSongDto, request: RequestUser, file: Express.Multer.File): Promise<object> {
        this.logger.verbose(`Uploading song directly into songs by user: ${JSON.stringify(request.token.username)}`);

        const newFile = await this.prisma.song
            .create({
                data: {
                    title: createSongDto.title,
                    uploadedBy: {
                        connect: {
                            id: request.token.sub,
                        },
                    },
                    songBucket: {
                        create: {
                            path: file.path,
                        },
                    },
                },
                include: {
                    uploadedBy: true,
                },
            })
            .catch((error) => {
                this.logger.error(`Error uploading song directly into songs by user: ${JSON.stringify(request.token.username)}`);
                throw new HttpException(`Error uploading song directly into songs: ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
            });

        this.logger.verbose(`Successfully uploaded song directly into songs by user: ${JSON.stringify(request.token.username)}`);

        return newFile;
    }

    async renameById(id: string, name: string, request: RequestUser): Promise<object> {
        this.logger.verbose(`Renaming song with id: ${id} by user: ${JSON.stringify(request.token.username)}`);

        if (!id) throw new HttpException(`Missing required fields`, HttpStatus.BAD_REQUEST);

        const song = await this.prisma.song
            .findUnique({
                where: {
                    id: id,
                },
            })
            .catch((error) => {
                this.logger.error(`Error fetching song with id: ${id} by user: ${JSON.stringify(request.token.username)}`);
                throw new HttpException(`Error fetching song: ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
            });

        if (!song) {
            throw new HttpException('Song not found', HttpStatus.NOT_FOUND);
        }

        const updatedSong = await this.prisma.song
            .update({
                where: {
                    id: id,
                },
                data: {
                    title: name,
                    updatedAt: new Date(),
                },
            })
            .catch((error) => {
                this.logger.error(`Error renaming song with id: ${id} by user: ${JSON.stringify(request.token.username)}`);
                throw new HttpException(`Error renaming song: ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
            });

        this.logger.verbose(`Song with id: ${id} successfully renamed by user: ${JSON.stringify(request.token.username)}`);

        return { message: `Song renamed successfully to ${updatedSong.title}` };
    }

    async deleteById(id: string, request: RequestUser): Promise<object> {
        this.logger.verbose(`Deleting song with id: ${id} by user: ${JSON.stringify(request.token.username)}`);

        if (!id) throw new HttpException(`Missing required fields`, HttpStatus.BAD_REQUEST);

        const song = await this.prisma.song
            .findUnique({
                where: {
                    id: id,
                },
                include: {
                    songBucket: true,
                },
            })
            .catch((error) => {
                this.logger.error(`Error fetching song with id: ${id} by user: ${JSON.stringify(request.token.username)}`);
                throw new HttpException(`Error fetching song: ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
            });

        if (!song) {
            throw new HttpException('Song not found', HttpStatus.NOT_FOUND);
        }

        await rimraf(song.songBucket.path).catch((error) => {
            this.logger.error(`Error deleting song file with song id: ${id} by user: ${JSON.stringify(request.token.username)}`);
            throw new HttpException(`Error deleting song file: ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
        });

        await this.prisma.song
            .delete({
                where: {
                    id: id,
                },
            })
            .catch((error) => {
                this.logger.error(`Error deleting song with id: ${id} by user: ${JSON.stringify(request.token.username)}`);
                throw new HttpException(`Error deleting song: ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
            });

        this.logger.error(`Successfully deleted song with id: ${id} by user: ${JSON.stringify(request.token.username)}`);

        return { message: 'Song deleted successfully' };
    }

    private async getWinnerObject(request: RequestUser): Promise<object> {
        this.logger.verbose(`Getting winner song for user: ${JSON.stringify(request.token?.username)}`);

        const latestSession = await this.prisma.votingSession
            .findFirst({
                where: {
                    end: {
                        lt: new Date(),
                    },
                },
                orderBy: {
                    end: 'desc',
                },
                include: {
                    songs: true,
                },
            })
            .catch((error) => {
                this.logger.error(`Error getting latest session for user: ${JSON.stringify(request.token?.username)}`);
                throw new HttpException(`Error getting latest voting session: ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
            });

        if (!latestSession) throw new HttpException(`No finished voting session found`, HttpStatus.INTERNAL_SERVER_ERROR);

        const votes = await this.prisma.vote
            .groupBy({
                by: ['songId'],
                _count: {
                    songId: true,
                },
                where: {
                    sessionId: latestSession.id,
                },
            })
            .catch((error) => {
                this.logger.error(`Error getting votes in latest session for user: ${JSON.stringify(request.token?.username)}`);
                throw new HttpException(`Error getting votes: ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
            });

        if (votes.length === 0) throw new HttpException(`No votes found in latest voting session found`, HttpStatus.INTERNAL_SERVER_ERROR);

        try {
            const winnerVote = votes.reduce((max, vote) => {
                return vote._count.songId > max._count.songId ? vote : max;
            }, votes[0]);

            const winnerSong = await this.prisma.song
                .findUnique({
                    where: {
                        id: winnerVote.songId,
                    },
                    include: {
                        songBucket: true,
                    },
                })
                .catch((error) => {
                    this.logger.error(`Error getting winner song with: ${error} for user: ${JSON.stringify(request.token?.username)}`);
                    throw new HttpException(`Error getting winner song: ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
                });

            if (!winnerSong) throw new HttpException(`Error winner song found`, HttpStatus.NOT_FOUND);

            this.logger.verbose(`Successfully got winner song for user: ${JSON.stringify(request.token?.username)}`);

            return winnerSong;
        } catch (error) {
            this.logger.error(`Error counting votes for user: ${JSON.stringify(request.token?.username)}`);
            throw new HttpException(`Error counting votes: ${error}`, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}

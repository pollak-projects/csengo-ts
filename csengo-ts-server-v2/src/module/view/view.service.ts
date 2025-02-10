import { Injectable, Logger } from '@nestjs/common';
import { PrismaConfigService } from '../../config/prisma.config.service';
import { RequestUser } from 'express';

@Injectable()
export class ViewService {
    private readonly logger = new Logger(ViewService.name);

    constructor(private readonly prisma: PrismaConfigService) {}

    async getSummaryOfVotesInSessionData(request: RequestUser): Promise<object> {
        this.logger.verbose(`Rendering summary of votes in session by user: ${JSON.stringify(request.token ?? 'unknown user')}`);

        const currentDateTime = new Date();

        try {
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
                        songs: true,
                        Vote: true,
                    },
                })
                .catch((error) => {
                    this.logger.error(`Error rendering current voting session by user to be rendered: ${JSON.stringify(request.token?.username)}`);
                    throw new Error(`Error rendering currently running voting session: ${error.message}`);
                });

            if (!votingSession) {
                throw new Error(`No active voting session found`);
            }

            const songVotes = votingSession.songs.map((song) => {
                const voteCount = votingSession.Vote.filter((vote) => vote.songId === song.id).length;
                return {
                    songId: song.id,
                    songTitle: song.title,
                    voteCount,
                };
            });

            songVotes.sort((a, b) => b.voteCount - a.voteCount);

            this.logger.verbose(`Successfully fetched summary of votes in session by user to be rendered: ${JSON.stringify(request.token?.username)}`);

            return {
                sessionId: votingSession.id,
                songs: songVotes,
            };
        } catch (error) {
            this.logger.error(`Error counting votes in current voting session by user to be rendered: ${JSON.stringify(request.token?.username)}`);
            return { error };
        }
    }

    async getPendingSongsData(request: RequestUser): Promise<object> {
        this.logger.verbose(`Rendering pending songs for user: ${JSON.stringify(request.token?.username)}`);

        try {
            const pendingSongs = await this.prisma.pendingSong
                .findMany({
                    orderBy: { createdAt: 'desc' },
                })
                .catch((error) => {
                    this.logger.error(`Error rendering pending songs for user: ${JSON.stringify(request.token?.username)}`);
                    throw new Error(`Error fetching pending songs: ${error.message}`);
                });

            if (pendingSongs.length === 0) throw new Error(`No pending songs found`);

            this.logger.verbose(`Pending songs successfully rendered for user: ${JSON.stringify(request.token?.username)}`);

            return { pendingSongs };
        } catch (error) {
            this.logger.error(`Error rendering pending songs for user: ${JSON.stringify(request.token?.username)} - ${error.message}`);
            return { error };
        }
    }
}

import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { PrismaConfigService } from '../../config/prisma.config.service';
import { RequestUser } from 'express';

/**
 * TV service
 * This service is responsible for handling all the TV related operations
 */
@Injectable()
export class TvService {
    private readonly logger = new Logger(TvService.name);

    constructor(private readonly prisma: PrismaConfigService) {}

    /**
     * Get summary of votes in session
     * @param request - user request
     */
    async getSummaryOfVotesInSession(request: RequestUser): Promise<string> {
        this.logger.verbose(`Fetching summary of votes in session by user: ${JSON.stringify(request.token ?? 'unknown user')}`);

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
                    songs: true,
                    Vote: true,
                },
            })
            .catch((error) => {
                this.logger.error(`Error fetching current voting session by user: ${JSON.stringify(request.token?.username)}`);
                throw new HttpException(`Error fetching currently running voting session: ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
            });

        if (!votingSession) {
            throw new HttpException('No active voting session found', HttpStatus.NOT_FOUND);
        }

        try {
            const songVotes = votingSession.songs.map((song) => {
                const voteCount = votingSession.Vote.filter((vote) => vote.songId === song.id).length;
                return {
                    songId: song.id,
                    songTitle: song.title,
                    voteCount,
                };
            });

            songVotes.sort((a, b) => b.voteCount - a.voteCount);

            this.logger.verbose(`Successfully fetched summary of votes in session by user: ${JSON.stringify(request.token?.username)}`);

            return JSON.stringify({
                sessionId: votingSession.id,
                songs: songVotes,
            });
        } catch (error) {
            this.logger.error(`Error counting votes in current voting session by user: ${JSON.stringify(request.token?.username)}`);
            throw new HttpException(`Error counting votes: ${error}`, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}

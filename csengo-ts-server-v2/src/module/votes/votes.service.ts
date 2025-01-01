import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { PrismaConfigService } from '../../config/prisma.config.service';
import { RequestUser } from 'express';

/**
 * Votes service
 * This service is responsible for handling all the votes related operations
 */
@Injectable()
export class VotesService {
    private readonly logger = new Logger(VotesService.name);

    constructor(private readonly prisma: PrismaConfigService) {}

    /**
     * Get summary of votes in session
     * @param request - user request
     */
    async getSummaryOfVotesInSession(request: RequestUser): Promise<string> {
        this.logger.verbose(`Fetching summary of votes in session by user: ${JSON.stringify(request.token.username)}`);

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
                this.logger.error(`Error fetching current voting session by user: ${JSON.stringify(request.token.username)}`);
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

            this.logger.verbose(`Successfully fetched summary of votes in session by user: ${JSON.stringify(request.token.username)}`);

            return JSON.stringify({
                sessionId: votingSession.id,
                songs: songVotes,
            });
        } catch (error) {
            this.logger.error(`Error counting votes in current voting session by user: ${JSON.stringify(request.token.username)}`);
            throw new HttpException(`Error counting votes: ${error}`, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Get voted songs by user id
     * @param request - user request
     * @returns
     */
    async getVotedSongsByUserId(request: RequestUser): Promise<string[]> {
        this.logger.verbose(`Fetching voted songs for user: ${JSON.stringify(request.token.username)}`);

        const userId = request.token.sub;

        if (!userId) {
            throw new HttpException(`Missing userId`, HttpStatus.BAD_REQUEST);
        }

        const sessionId = await this.getCurrentVotingSessionId();

        const votes = await this.prisma.vote
            .findMany({
                where: {
                    userId,
                    sessionId,
                },
                select: {
                    songId: true,
                },
            })
            .catch((error) => {
                this.logger.error(`Error fetching votes for user: ${JSON.stringify(request.token.username)} in session: ${sessionId}`);
                throw new HttpException(`Error fetching votes: ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
            });

        this.logger.verbose(`Successfully fetched voted songs for user: ${JSON.stringify(request.token.username)}`);

        if (votes.length === 0) {
            throw new HttpException(`No votes found for user: ${request.token.username}`, HttpStatus.NOT_FOUND);
        }

        return votes.map((vote) => vote.songId);
    }

    /**
     * Vote up on song
     * @param id - id of the song
     * @param request - user request
     * @returns
     */
    async voteUp(id: string, request: RequestUser): Promise<string> {
        this.logger.verbose(`Voteing up on song with id: ${id} by user: ${JSON.stringify(request.token.username)}`);

        const userId = request.token.sub;

        if (!userId) throw new HttpException(`Missing userId`, HttpStatus.BAD_REQUEST);

        const existingVote = await this.prisma.vote
            .findFirst({
                where: {
                    userId,
                    songId: id,
                    sessionId: await this.getCurrentVotingSessionId(),
                },
            })
            .catch((error) => {
                this.logger.error(`Error fetching existing vote for song with id: ${id} by user: ${JSON.stringify(request.token.username)}`);
                throw new HttpException(`Error fetching existing vote ${error}`, HttpStatus.BAD_REQUEST);
            });

        if (existingVote) throw new HttpException(`User already voted for song: ${id}`, HttpStatus.BAD_REQUEST);

        await this.prisma.vote
            .create({
                data: {
                    userId,
                    songId: id,
                    sessionId: await this.getCurrentVotingSessionId(),
                },
            })
            .catch((error) => {
                this.logger.error(`Error creating vote for song with id: ${id} by user: ${JSON.stringify(request.token.username)}`);
                throw new HttpException(`Error creating vote: ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
            });

        this.logger.verbose(`Successfully created vote for song with id: ${id} by user: ${JSON.stringify(request.token.username)}`);

        return JSON.stringify({ message: `Vote successfully created for song: ${id}` });
    }

    async voteDown(id: string, request: RequestUser): Promise<string> {
        this.logger.verbose(`Voteing down on song with id: ${id} by user: ${JSON.stringify(request.token.username)}`);

        const userId = request.token.sub;

        const existingVote = await this.prisma.vote
            .findFirst({
                where: {
                    userId,
                    songId: id,
                    sessionId: await this.getCurrentVotingSessionId(),
                },
            })
            .catch((error) => {
                this.logger.error(`Error fetching existing vote for song with id: ${id} by user: ${JSON.stringify(request.token.username)}`);
                throw new HttpException(`Error fetching existing vote for vote down: ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
            });

        if (!existingVote) throw new HttpException(`No existing vote found`, HttpStatus.NOT_FOUND);

        await this.prisma.vote
            .delete({
                where: {
                    id: existingVote.id,
                },
            })
            .catch((error) => {
                this.logger.error(`Error deleting vote for song with id: ${id} by user: ${JSON.stringify(request.token.username)}`);
                throw new HttpException(`Error deleting vote for vote down: ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
            });

        this.logger.verbose(`Successfully deleted vote for song with id: ${id} by user: ${JSON.stringify(request.token.username)}`);

        return JSON.stringify({ message: `Sucessfully deleted vote for song: ${id}` });
    }

    /**
     * Get current voting session id
     * @returns
     */
    private async getCurrentVotingSessionId(): Promise<string> {
        const currentDateTime = new Date();
        const votingSession = await this.prisma.votingSession.findFirst({
            where: {
                start: {
                    lte: currentDateTime,
                },
                end: {
                    gte: currentDateTime,
                },
            },
        });

        if (!votingSession) {
            throw new HttpException('No active voting session found', HttpStatus.NOT_FOUND);
        }

        return votingSession.id;
    }
}

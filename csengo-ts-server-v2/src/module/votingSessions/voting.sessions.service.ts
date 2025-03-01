import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { PrismaConfigService } from '../../config/prisma.config.service';
import { RequestUser } from 'express';
import { SessionDto } from './dto/voting.session.dto';

/**
 * Voting session service
 */
@Injectable()
export class VotingSessionService {
    private readonly logger = new Logger(VotingSessionService.name);

    constructor(private readonly prisma: PrismaConfigService) {}

    /**
     * Get all sessions
     * @param request - user request
     * @returns
     */
    async getAllSessions(request: RequestUser): Promise<string> {
        this.logger.verbose(`Fetching all sessions by user: ${JSON.stringify(request.token.username)}`);

        const sessions = await this.prisma.votingSession
            .findMany({
                orderBy: {
                    end: 'desc',
                },
                include: {
                    songs: true,
                    Vote: true,
                },
            })
            .catch((error) => {
                this.logger.error(`Error fetching session by user: ${JSON.stringify(request.token.username)}`);
                throw new HttpException(`Error fetching sessions: ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
            });

        this.logger.verbose(`Successfully fetched sessions by user: ${JSON.stringify(request.token.username)}`);

        if (sessions.length === 0) throw new HttpException(`No sessions found`, HttpStatus.NOT_FOUND);

        return JSON.stringify(sessions);
    }

    async createSession(sessionBody: SessionDto, request: RequestUser): Promise<string> {
        this.logger.verbose(`Creating voting session by user: ${JSON.stringify(request.token.username)}, with body: ${JSON.stringify(sessionBody)}`);

        if (new Date(sessionBody.start) > new Date(sessionBody.end)) {
            this.logger.error(`The start time cannot be later than the end time by user: ${JSON.stringify(request.token.username)}`);
            throw new HttpException('The start time cannot be later than the end time', HttpStatus.BAD_REQUEST);
        }

        const overlappingSession = await this.prisma.votingSession
            .findFirst({
                where: {
                    OR: [
                        {
                            start: { lte: sessionBody.end },
                            end: { gte: sessionBody.start },
                        },
                    ],
                },
            })
            .catch((error) => {
                this.logger.error(`Error fecthing current session to check overlapping by user: ${JSON.stringify(request.token.username)}`, error);
                throw new HttpException(`Error checking for overlapping sessions: ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
            });

        if (overlappingSession) {
            this.logger.error(
                `The duration of the voting session overlaps with an existing voting session by user: ${JSON.stringify(request.token.username)}`,
                overlappingSession,
            );
            throw new HttpException('The duration of the voting session overlaps with an existing voting session', HttpStatus.CONFLICT);
        }

        const songNames = await this.prisma.song
            .findMany({
                where: {
                    OR: sessionBody.songIds.map((songId) => ({ id: songId })),
                },
                select: {
                    title: true,
                },
            })
            .catch((error) => {
                this.logger.error(`Error fetching songs for session creation by user: ${JSON.stringify(request.token.username)}`, error);
                throw new HttpException(`Error fetching songs for session creation: ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
            });

        const newSession = await this.prisma.votingSession
            .create({
                data: {
                    songNames: songNames.map((song) => song.title!),
                    start: sessionBody.start,
                    end: sessionBody.end,
                    songs: {
                        connect: sessionBody.songIds.map((songId) => ({ id: songId })),
                    },
                },
            })
            .catch((error) => {
                this.logger.error(`Error creating new voting session by user: ${JSON.stringify(request.token.username)}`);
                throw new HttpException(`Error creating voting session: ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
            });

        this.logger.verbose(`Successfully created new voting session by user: ${JSON.stringify(request.token.username)}`);

        return JSON.stringify({ message: `Successfully created new session: ${JSON.stringify(newSession)}` });
    }

    /**
     * update session by id
     * @param id - id of the session
     * @param sessionBody - new sessin body
     * @param request -
     * @returns
     */
    async updateSessionById(id: string, sessionBody: SessionDto, request: RequestUser): Promise<string> {
        this.logger.verbose(`Updated voting session with id: ${id} by user: ${JSON.stringify(request.token.username)}`);

        if (new Date(sessionBody.start) > new Date(sessionBody.end)) {
            throw new HttpException('The start time cannot be later than the end time', HttpStatus.BAD_REQUEST);
        }

        const overlappingSession = await this.prisma.votingSession
            .findFirst({
                where: {
                    OR: [
                        {
                            start: { lte: sessionBody.end },
                            end: { gte: sessionBody.start },
                        },
                    ],
                },
            })
            .catch((error) => {
                this.logger.error(`Error fecthing current session to check overlapping by user: ${JSON.stringify(request.token.username)}`);
                throw new HttpException(`Error checking for overlapping sessions: ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
            });

        if (overlappingSession && overlappingSession.id != id)
            throw new HttpException('The duration of the voting session overlaps with an existing voting session', HttpStatus.CONFLICT);

        const songNames = await this.prisma.song
            .findMany({
                where: {
                    OR: sessionBody.songIds.map((songId) => ({ id: songId })),
                },
                select: {
                    title: true,
                },
            })
            .catch((error) => {
                this.logger.error(`Error fetching songs for session creation by user: ${JSON.stringify(request.token.username)}`);
                throw new HttpException(`Error fetching songs for session creation: ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
            });

        const updatedSession = await this.prisma.votingSession
            .update({
                where: { id },
                data: {
                    songNames: songNames.map((song) => song.title!),
                    start: sessionBody.start,
                    end: sessionBody.end,
                    songs: {
                        set: [],
                        connect: sessionBody.songIds.map((songId) => ({ id: songId })),
                    },
                },
            })
            .catch((error) => {
                this.logger.error(`Error updating voting session with id: ${id} by user: ${JSON.stringify(request.token.username)}`);
                throw new HttpException(`Error updating voting session: ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
            });

        this.logger.verbose(`Successfully updated voting session with id: ${id} by user: ${JSON.stringify(request.token.username)}`);

        return JSON.stringify({ message: `Successfully updated session: ${JSON.stringify(updatedSession)}` });
    }

    /**
     * Delete session by id
     * @param id - id of the session
     * @param request - user request
     * @returns
     */
    async deleteSessionById(id: string, request: RequestUser): Promise<string> {
        this.logger.verbose(`Deleting voting session with id: ${id} by user: ${request.token.username}`);

        if (!id) throw new HttpException(`Missing required fields`, HttpStatus.BAD_REQUEST);

        const session = await this.prisma.votingSession
            .findUnique({
                where: { id },
            })
            .catch((error) => {
                this.logger.error(`Error fetching voting session for deletion with id: ${id} by user: ${JSON.stringify(request.token.username)}`);
                throw new HttpException(`Error fetching voting session for deletion: ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
            });

        if (!session) throw new HttpException(`Voting session not found`, HttpStatus.NOT_FOUND);

        await this.prisma.votingSession
            .delete({
                where: { id },
            })
            .catch((error) => {
                this.logger.error(`Error deleting voting session with id: ${id} by user: ${JSON.stringify(request.token.username)}`);
                throw new HttpException(`Error deleting voting session: ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
            });

        this.logger.verbose(`Successfully deleted voting session with id: ${id} by user: ${request.token.username}`);

        return JSON.stringify({ message: `Successfully deleted session: ${id}` });
    }
}

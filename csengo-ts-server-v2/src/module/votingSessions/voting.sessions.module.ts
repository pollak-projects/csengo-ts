import { Module } from '@nestjs/common';
import { VotingSessionController } from './voting.sessions.controller';
import { VotingSessionService } from './voting.sessions.service';

@Module({
    imports: [],
    controllers: [VotingSessionController],
    providers: [VotingSessionService],
})
export class VotingSessionsModule {}

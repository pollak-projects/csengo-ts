import { Module } from '@nestjs/common';
import { AppController } from './app/app.controller';
import { AppService } from './app/app.service';
import { ConfigLocalModule } from '../config/config.local.module';
import { RouterModule } from '@nestjs/core';
import { AuthModule } from './auth/auth.module';
import { PendingSongsModule } from './pendingSongs/pending.songs.module';
import { SongsModule } from './songs/songs.module';
import { TvModule } from './tv/tv.module';
import { UserModule } from './user/user.module';
import { VotesModule } from './votes/votes.module';
import { VotingSessionsModule } from './votingSessions/voting.sessions.module';
import { ThrottlerModule } from '@nestjs/throttler';
import { ViewModule } from './view/view.module';
import { SnipperModule } from './snipper/snipper.module';

@Module({
    imports: [
        ConfigLocalModule,
        AuthModule,
        AuthModule,
        PendingSongsModule,
        SongsModule,
        TvModule,
        UserModule,
        SnipperModule,
        VotesModule,
        VotingSessionsModule,
        ViewModule,
        ThrottlerModule.forRoot([
            {
                name: 'short',
                ttl: 1000,
                limit: 50,
            },
            {
                name: 'medium',
                ttl: 10000,
                limit: 250,
            },
            {
                name: 'long',
                ttl: 60000,
                limit: 400,
            },
        ]),
        RouterModule.register([
            {
                path: 'app',
                module: AppModule,
            },
            {
                path: 'auth',
                module: AuthModule,
            },
            {
                path: 'pending-songs',
                module: PendingSongsModule,
            },
            {
                path: 'songs',
                module: SongsModule,
            },
            {
                path: 'snipper',
                module: SnipperModule,
            },
            {
                path: 'tv',
                module: TvModule,
            },
            {
                path: 'users',
                module: UserModule,
            },
            {
                path: 'votes',
                module: VotesModule,
            },
            {
                path: 'voting-sessions',
                module: VotingSessionsModule,
            },
            {
                path: 'view',
                module: ViewModule,
            },
        ]),
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {}

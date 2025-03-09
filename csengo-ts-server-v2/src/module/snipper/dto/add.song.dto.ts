import { IsInt, IsString, Matches, Min } from 'class-validator';

export class AddYoutubeSongDto {
    @IsString()
    @Matches('https://(?:m.youtube.com|yt.be|youtube.com|youtu.be|www.youtube.com)')
    ytUrl: string;

    @IsInt()
    @Min(0)
    from: number;

    @IsInt()
    @Min(0)
    to: number;

    @IsString()
    title: string;
}

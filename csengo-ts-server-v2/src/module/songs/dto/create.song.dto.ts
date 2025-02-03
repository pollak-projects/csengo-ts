import { IsString } from 'class-validator';

export class CreateSongDto {
    @IsString()
    title: string;
}

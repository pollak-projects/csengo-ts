import { IsArray, IsDateString, IsNotEmpty, IsString } from 'class-validator';

export class SessionDto {
    @IsArray()
    @IsString({ each: true })
    @IsNotEmpty()
    songIds: string[];

    @IsDateString()
    @IsNotEmpty()
    start: string;

    @IsDateString()
    @IsNotEmpty()
    end: string;
}

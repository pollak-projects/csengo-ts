import { IsNotEmpty, IsString, Length } from 'class-validator';

export class UpdatePassDto {
    @IsNotEmpty()
    @IsString()
    userId: string;

    @IsNotEmpty()
    @IsString()
    @Length(6, 20)
    password: string;
}

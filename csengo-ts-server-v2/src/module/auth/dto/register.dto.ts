import { IsNotEmpty, IsNumberString, IsString, Length } from 'class-validator';

export class RegisterDto {
    @IsNotEmpty()
    @IsString()
    @Length(5, 30)
    username: string;

    @IsNotEmpty()
    @IsString()
    email: string;

    @IsNotEmpty()
    @IsString()
    @Length(6, 20)
    password: string;

    @IsNotEmpty()
    @IsNumberString()
    om: string;
}

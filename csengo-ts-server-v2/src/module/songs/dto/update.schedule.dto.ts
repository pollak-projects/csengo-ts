import { IsArray } from 'class-validator';


export class UpdateScheduleDto {
    @IsArray()
    readonly schedule: string[];
}

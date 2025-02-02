import { IsNotEmpty, IsString, IsEnum } from 'class-validator';
import { RoleEnum } from '../../role/role.enum';

export class UpdateRoleDto {
    @IsNotEmpty()
    @IsString()
    userId: string;

    @IsNotEmpty()
    @IsEnum(RoleEnum)
    role: RoleEnum;
}

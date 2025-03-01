declare module 'csengoJwt' {
    import { RoleEnum } from '../module/role/role.enum';

    export interface JwtPayload {
        sub: string;
        username: string;
        hashedPassword: string;
        roles: RoleEnum[];
    }
}

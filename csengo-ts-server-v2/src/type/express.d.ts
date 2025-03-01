import 'express';
import { JwtPayload } from 'csengoJwt';

declare module 'express' {
    interface RequestUser extends Request {
        token: JwtPayload;
    }
}

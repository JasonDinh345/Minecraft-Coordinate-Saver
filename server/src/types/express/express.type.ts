import 'express';
import { User } from '../user/user.type';

declare module 'express'{
    export interface Response {
       
        message?: string
    }
    export interface Request {
        user?: User | Partial<User>
        
    }
}
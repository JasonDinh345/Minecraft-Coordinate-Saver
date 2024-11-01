import 'express';
import { User } from '../user/user.type';

declare module 'express'{
    export interface Response {
        
        message?: string
    }
}
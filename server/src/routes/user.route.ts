import {Router, Request, Response, NextFunction} from 'express';
import pool from '../utils/db'
import { QueryResult } from 'pg';
const userRouter : Router = Router();
import bcrypt from "bcrypt";
type User = {
    id: number,
    username: string,
    email: string,
    password: string,
    created_at: Date
}
/**
 * Request to get all User Data
 */
userRouter.get('/', async(req :Request, res : Response) =>{
    try{
        const result: QueryResult = await pool.query("SELECT * FROM users");
        res.json(result.rows);
    }catch(err){
        console.error("Error has occured when getting all users",err.message)
    }
})

export default userRouter;
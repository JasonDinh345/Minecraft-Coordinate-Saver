import express, {Express, Request, Response} from 'express';
import authRouter from './routes/auth.route';
import { Server } from 'http';
const authApp: Express = express();

authApp.use(express.json());
/**
 * Request to see if API is running
 */
authApp.get("/", (req : Request, res: Response)=>{
    res.status(200).send('Auth Server is up and running');
})
/**
 * Router for users Table
 */
authApp.use('/auth', authRouter);
/**
 * API port on 5000
 */

const authServer: Server = authApp.listen(5000 ,()=>{
    console.log("Auth Server running!")
})

export  {authApp, authServer}
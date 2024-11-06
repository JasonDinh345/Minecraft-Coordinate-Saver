import express, {Express, Request, Response} from 'express';
import authRouter from './routes/auth.route';
import { Server } from 'http';
const appAuth: Express = express();

appAuth.use(express.json());
/**
 * Request to see if API is running
 */
appAuth.get("/", (req : Request, res: Response)=>{
    res.status(200).send('Auth Server is up and running');
})
/**
 * Router for users Table
 */
appAuth.use('/auth', authRouter);
/**
 * API port on 4000
 */
const authServer: Server = appAuth.listen(5000,()=>{
    console.log("Auth Server running!")
})

export  {appAuth, authServer}
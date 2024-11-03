import express, {Express, Request, Response} from 'express';
import userRouter from './routes/user.route';
const app: Express = express();

app.use(express.json());
/**
 * Request to see if API is running
 */
app.get("/", (req : Request, res: Response)=>{
    res.status(200).send('API is up and running');
})
/**
 * Router for users Table
 */
app.use('/user', userRouter);
/**
 * API port on 4000
 */
app.listen(4000,()=>{
    console.log("Server running!")
})

export default app
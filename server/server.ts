import express, {Express, Request, Response} from 'express';

const app: Express = express();

app.get("/", (req : Request, res: Response)=>{
    res.send("hello")
})

app.listen(4000,()=>{
    console.log("Server running!")
})
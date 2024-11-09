import {authApp} from '@/authServer'; 
import {app} from '@/server'; 
import { Server } from 'http';


app.listen(4000,()=>{
    console.log("Server running!")
})

authApp.listen(5000 ,()=>{
    console.log("Auth Server running!")
})
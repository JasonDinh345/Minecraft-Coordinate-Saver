import { Request, Response } from 'express';
import { UserModel } from '../models/user.model';
import { User } from '../types/user/user.type';

export class UserController{
    private userModel : UserModel

    constructor(userModel: UserModel){
        this.userModel = userModel;
    }
}
async function getAllUsers(req:Request, res: Response): Promise<void>{
    const id = parseInt(req.params.id, 10)
    try{
        const users: User[] | null = await this.userModel.getAllUsers();
        if(!users){
            res.send(404).json({message: "Users not found"})
        }
        res.send(200).json(users)
    }catch(err){
        console.log(err)
        res.send(500).json({message: "Server Error occured while retriving all Users"})
    }
}
async function getUserByID(req:Request, res: Response): Promise<void>{
    const id = parseInt(req.params.id, 10)
    try{
        const user: User | null = await this.userModel.getUserByID(id)
        if(!user){
            res.send(404).json({message:`Couldn't find user with ID: ${id}`})
        }
        res.send(200).json(user)
    }catch(err){
        console.log(err)
        res.send(500).json({message: `Server error occured while getting user with ID: ${id}`})
    }
}
async function createNewUserreq(req : Request, res: Response): Promise<void>{
    try{
        const user = await this.userModel.createNewUser(req.body)
        if(!user){
            res.send(500).json({message: "Unexpected error has occured!"})
        }
        res.send(201).json(user)
    }catch(err){
        console.log(err)
        switch(err.message){
            case "INVALID_FIELD":
                res.send(400).json({message: "All fields are required!"})
                break;
            case "DUPE_EMAIL":
                res.send(409).json({message: "Email already taken!"})
                break;
            default:
                res.send(500).json({message: "Unexpected server error has occured!"})
                break;
        }
        
    }
}
async function updateUser(req:Request, res: Response): Promise<void>{
    const id = parseInt(req.params.id, 10)
    try{
        const user: User | null = await this.userModel.updateUser(id, req.body)
        if(!user){
            res.send(404).json({message:`Couldn't find user with ID: ${id}`})
        }
        res.send(200).json(user)
    }catch(err){
        console.log(err)
        res.send(500).json({message: `Server error occured while updating user with ID: ${id}`})
    }
}
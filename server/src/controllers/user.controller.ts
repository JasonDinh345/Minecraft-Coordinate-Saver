import { Request, Response } from 'express';
import { UserModel } from '../models/user.model';
import { User } from '../types/user/user.type';
/**
 * Controller for user
 * Communicates with the model and request
 */
export class UserController{
    /**
     * UserModel that communicates with DB
     */
    private userModel : UserModel
    /**
     * Constructs UserConrtoller with userModel
     * @param userModel, communication to DB
     */
    constructor(userModel: UserModel){
        this.userModel = userModel;
    }
    /**
     * Finds all users in the DB
     * @param req, Request from user/admin input
     * @param res, Sends all users, else an error if occured
     */
    async getAllUsers(req:Request, res: Response): Promise<void>{
        try{
            const users: User[] | null = await this.userModel.getAllUsers();
            if(!users || users.length == 0){
                res.status(404).json({message: "Users not found"})
                
            }else{
                res.status(200).json(users)
            }
            
            
            
            
        }catch(err){
            console.log(err)
            res.status(500).json({message: "Server Error occured while retriving all Users"})
            
        }
    }
    /**
     * Finds user with given id
     * @param req, Request containing the given id from the URL
     * @param res, Sends the desired user, error if not found
     */
    async getUserByID(req:Request, res: Response): Promise<void>{
        const id = parseInt(req.params.id, 10)
        try{
            const user: User | null = await this.userModel.getUserByID(id)
            if(!user){
                res.status(404).json({message:`Couldn't find user with ID: ${id}`})
                
            }else{
                res.status(200).json(user)
            }
        }catch(err){
            console.log(err)
            res.status(500).json({message: `Server error occured while getting user with ID: ${id}`})
         
        }
    }
    /**
     * Inserts a new user into the DB
     * @param req, Request from user/admin input with the given fields
     * @param res, Sends new user, else an error
     */
    async createNewUserreq(req : Request, res: Response): Promise<void>{
        try{
            const user = await this.userModel.createNewUser(req.body)
            if(!user){
                res.status(500).json({message: "Unexpected error has occured!"})
                
            }else{
                res.status(201).json(user)
            }
            
        }catch(err){
            console.log(err)
            switch(err.message){
                case "INVALID_FIELD":
                    res.status(400).json({message: "All fields are required!"})
                    break;
                case "DUPE_EMAIL":
                    res.status(409).json({message: "Email already taken!"})
                    break;
                default:
                    res.status(500).json({message: "Unexpected server error has occured!"})
                    break;
            }
        }
    }
    /**
     * Updates user with given fields 
     * @param req, Request from user/admin input with the updated fields 
     * and the id from the URL
     * @param res, Sends updated user, else an error
     */
    async updateUser(req:Request, res: Response): Promise<void>{
        const id = parseInt(req.params.id, 10)
        try{
            const user: User | null = await this.userModel.updateUser(id, req.body)
            if(!user){
                res.status(404).json({message:`Couldn't find user with ID: ${id}`})
                
            }else{
                res.status(200).json(user)
            }
            
        }catch(err){
            console.log(err)

            switch(err.message){
                case "DUPE_EMAIL":
                    res.status(409).json({message: "Email already taken!"})
                    break;
                default:
                    res.status(500).json({message: `Server error occured while updating user with ID: ${id}`})
                    break;
            
            }
        }
    }
    /**
     * Deletes given user
     * @param req, Request containing the given id from the URL
     * @param res, Sends no content, also a message describing the response
     */
    async deleteUser(req:Request, res: Response): Promise<void>{
        const id = parseInt(req.params.id, 10)
        try{
            const hasDeleted :  boolean = await this.userModel.deleteUser(id)
            if(hasDeleted){
                res.status(204).json({message: "Deleted User"})
            }else{
                res.status(404).json({message:`Couldn't find user with ID: ${id}`})
            }
    
        }catch(err){
            console.log(err)
            res.status(500).json({message: `Server error occured while updating user with ID: ${id}`})
        }
    }
    /**
     * Authenticatates user if correct pass and username
     * @param req, Request containing given username and password
     * @param res, Sends the user if authenticated, else an error
     */
    async authenticateUser(req:Request, res: Response): Promise<void>{
        try{
            const user : User = await this.userModel.authenticateUser(req.body)
            if(user){
                res.status(200).json(user)
            }else{
                res.status(500).json({message:"Unexpected server error has occured!"})
            }
        }catch(err){
            switch(err.message){
                case("INVALID_FIELD"):
                    res.status(400).json({message: "Enter a valid username and password"})
                    break;
                case("INCORRECT_PASSWORD"):
                    res.status(401).json({message: "Incorrect password!"})
                default:
                    res.status(500).json("Unexpected server error has occured!")
                    break;
            }
        }
    }
}


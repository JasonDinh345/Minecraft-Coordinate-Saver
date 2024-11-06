import { NextFunction, Request, Response } from 'express';
import { UserModel } from '@/models/user.model';
import { User } from '@/types/user/user.type';
import jwt from 'jsonwebtoken'
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
     * Middleware to authenicate the current accessToken
     * @param req, Request containing the token, adds a username to the request if authenticated
     * @param res, Sends 400s codes if error is found, else used in other requests
     * @param next continues to other requests
     */
    authenticateToken(req:Request, res: Response, next: NextFunction): Promise<void>{
        const authHeader = req.headers['authorization']
        const token = authHeader && authHeader.split(' ')[1]
        if(!token){
            res.status(403).json("Token cannot be null or undefined")
            return;
        }
        jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err:Error, user: Partial<User>)=>{
            if(err){
                res.status(403).json({message:"Token can't be verified"})
            }
            req.user = user
            next()
        })
    }
    /**
     * Finds user with given username, given from authenticateToken method
     * @param req, Request containing the given user 
     * @param res, Sends the desired user, error if not found
     */
    async getUser(req:Request, res: Response): Promise<void>{
    
        try{
            const user: User | null = await this.userModel.getUserByEmail(req.user.email)
            if(!user){
                res.status(404).json({message:`Couldn't find user with email: ${req.user.email}`})
                
            }else{
                res.status(200).json(user)
            }
        }catch(err){
            console.log(err)
            res.status(500).json({message: `Server error occured while getting user with email: ${req.user.email}`})
         
        }
    }
    
    /**
     * Inserts a new user into the DB
     * @param req, Request from user/admin input with the given fields
     * @param res, Sends new user, else an error
     */
    async createNewUser(req : Request, res: Response): Promise<void>{
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
     * and the authenticated user
     * @param res, Sends updated user, else an error
     */
    async updateUser(req:Request, res: Response): Promise<void>{
        try{
            const user: User | null = await this.userModel.updateUser(req.user.email, req.body)
            if(!user){
                res.status(404).json({message:`Couldn't find user with email: ${req.user.email}`})
                
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
                    res.status(500).json({message: `Server error occured while updating user with email: ${req.user.email}`})
                    break;
            
            }
        }
    }
    /**
     * Deletes given user
     * @param req, Request containing the given authenticated user
     * @param res, Sends no content, also a message describing the response
     */
    async deleteUser(req:Request, res: Response): Promise<void>{
        try{
            const hasDeleted :  boolean = await this.userModel.deleteUser(req.user.email)
            if(hasDeleted){
                res.status(204).json({message: "Deleted User"})
            }else{
                res.status(404).json({message:`Couldn't find user with email: ${req.user.email}`})
            }
    
        }catch(err){
            console.log(err)
            res.status(500).json({message: `Server error occured while updating user with email: ${req.user.email}`})
        }
    }
    
}


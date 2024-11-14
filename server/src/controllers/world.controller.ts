import { Request, Response } from 'express';
import {UserWorldRoles, World, WorldCoords, UserRoleQuery} from '@/types/world/world.type'
import { WorldModel } from '@/models/world.model';
/**
 * Controller for World Route
 */
export class WorldController{
    /** Connection to model */
    private worldModel : WorldModel
    /**
     * Construction of WorldController
     * @param worldModel connection to db
     */
    constructor(worldModel: WorldModel){
        this.worldModel = worldModel
    }
    /**
     * Sends a given world 
     * @param req Contains id from the url relating to a world
     * @param res Sends a given world, unless an error occured
     */
    async getWorld(req : Request, res: Response): Promise<void>{
        const world_id = parseInt(req.params.id)
        try{
            const world: World | null = await this.worldModel.getWorld(world_id);
            if(world){
                res.status(200).json(world)
            }else{
                res.status(404).json({message:`Can't find world with ID: ${world_id}`})
            }

        }catch(err){
            console.log(err)
            res.status(500).json({message: `Unexpected server error while getting world with ID: ${world_id}`})
        }
    }
    /**
     * Sends all users related to a world
     * @param req Contains id from the url relating to a world
     * @param res Sends all users in the given world, unless and error occured
     */
    async getAllUsersInAWorld(req : Request, res: Response): Promise<void>{
        const world_id = parseInt(req.params.id)
        try{
            const users : { username: string, role_name: string }[] = await this.worldModel.getAllUsersInAWorld(world_id)
            
            res.status(200).json(users)
            
        }catch(err){
            switch(err.message){
                case "INVALID_ID":
                    res.status(404).json({message:`Can't find world with ID: ${world_id}`})
                    break;
                default:
                    res.status(500).json({message: `Unexpected server error while getting world with ID: ${world_id}`})
                    break;
            }
            
        }

    }
    /**
     * Sends all coords related to a world 
     * @param req Contains id from the url relating to a world
     * @param res Sends all coords related to a world, unless and error occured
     */
    async getAllCoordsInAWorld(req : Request, res: Response): Promise<void>{
        const world_id = parseInt(req.params.id)
        try{
            const coords : WorldCoords[] = await this.worldModel.getAllCoordsInAWorld(world_id)
            
            res.status(200).json(coords)
            
        }catch(err){
            switch(err.message){
                case "INVALID_ID":
                    res.status(404).json({message:`Can't find world with ID: ${world_id}`})
                    break;
                default:
                    res.status(500).json({message: `Unexpected server error while getting world with ID: ${world_id}`})
                    break;
            }
        }
    }
    /**
     * Sends the newly created world 
     * @param req Fields relating to a world
     * @param res Sends the newly created world, unless an error occured
     */
    async createNewWorld(req : Request, res: Response): Promise<void>{
        try{
            const world : World = await this.worldModel.createNewWorld(req.body)
            if(world){
                res.status(201).json(world)
            }else{
                res.status(500).json({message: `Unexpected server error while creating new world`})
            }
        }catch(err){
            switch(err.message){
                case "INVALID_FIELD":
                    res.status(400).json({message: "Name must be not null"})
                    break;
                default:
                    res.status(500).json({message: `Unexpected server error while creating new world`})
                    break
            }
            
        }
    }
    /**
     * Sends a message relating to the result of the query
     * @param req Contains id from the url relating to a world, and fields containing user email and the role
     * @param res Sends a message relating to the result of the query
     */
    async addUserToWorld(req : Request, res: Response): Promise<void>{
        const world_id = parseInt(req.params.id)
        try{
            const userRoleQuery : UserRoleQuery = await this.worldModel.addUserToWorld(world_id, req.body)
            if(userRoleQuery){
                res.status(201).json({message: "Successfull added user to server!"})
            }else{
                res.status(403).json({message: `User is already in the world` })
            }
        }catch(err){
            console.log(err)
            switch(err.message){
                case "INVALID_FIELDS":
                    res.status(400).json({message: `Fields can't be empty` })
                    break;
                case "USER_NOT_FOUND":
                    res.status(404).json({message: `Can't find user with email: ${req.body.user_email}` })
                    break;
                case "ROLE_NOT_FOUND":
                     res.status(404).json({message: `Can't find role with name: ${req.body.role_name}` })
                    break;
                default:
                    res.status(500).json({message: `Unexpected server error while adding user to world`})
                    break
            } 
        }
   }
   /**
    * Sends the newly added coords
    * @param req Contains id from the url relating to a world, and fields containing the coord data
    * @param res Sends the newly added coords, unless an error occurs
    */
    async addNewCoordToWorld(req : Request, res: Response): Promise<void>{
        const world_id = parseInt(req.params.id)
        try{
            const coords : WorldCoords = await this.worldModel.addNewCoordToWorld(world_id, req.body)
            if(coords){
                res.status(201).json(coords)
            }else{
                res.status(403).json({message: `Coords already exist with name: ${req.body.name}`})
            }
        }catch(err){
            switch(err.message){
                case "INVALID_FIELDS":
                    res.status(400).json({message: "Fields must be not null"})
                    break;
                case "INVALID_ID":
                    res.status(404).json(`Couldn't find world with ID: ${world_id}`)
                    break;
                default:
                    res.status(500).json({message: `Unexpected server error while adding coords to world`})
                    break
            } 
        }
    }
    /**
     * Sends the updated world
     * @param req Contains id from the url relating to a world, and updated fields for the world
     * @param res Sends the updated world, unless an error occurs
     */
    async updateWorldData(req : Request, res: Response): Promise<void>{
        const world_id = parseInt(req.params.id)
        try{
            const world : World = await this.worldModel.updateWorldData(world_id, req.body)
            if(world){
                res.status(200).json(world)
            }else{
                res.status(404).json(`Couldn't find world with ID: ${world_id}`)
            }
        }catch(err){
            switch(err.message){
                default:
                    res.status(500).json({message: `Unexpected server error while updating world data`})
                    break
            } 
        }
    }
    /**
     * Sends the updated user, role relation in a given world
     * @param req Contains id from the url relating to a world, and field containing the updated role
     * @param res Sends the updated user, role relation in a given world, unless and error occurs
     */
    async updateUserRole(req : Request, res: Response): Promise<void>{
        const world_id = parseInt(req.params.id)
        try{
            const userWorldRole : UserWorldRoles = await this.worldModel.updateUserRole(world_id, req.body)
            if(userWorldRole){
                res.status(200).json(userWorldRole)
            }else{
                
                res.status(404).json(`Couldn't find a user, world, or role with given IDs`)
            }
        }catch(err){
            switch(err.message){
                case "INVALID_FIELDS":
                    res.status(400).json({message: `Fields can't be empty` })
                    break;
                case "USER_NOT_FOUND":
                    res.status(404).json({message: `Can't find user with email: ${req.body.user_email}` })
                    break;
                case "ROLE_NOT_FOUND":
                     res.status(404).json({message: `Can't find role with name: ${req.body.role_name}` })
                    break;
                default:
                    res.status(500).json({message: `Unexpected server error while adding user to world`})
                    break
            } 
        }
    }
    /**
     * Sends the updated coords from a given world
     * @param req Contains name and world id from the url relating to coords, and fields containing the updated coordinates
     * @param res Sends the updated coords from a given world, unless and error occured
     */
    async updateCoords(req : Request, res: Response): Promise<void>{
        const world_id = parseInt(req.params.id)
        try{
            const coords : WorldCoords = await this.worldModel.updateCoords(world_id, req.params.name, req.body)
            if(coords){
                res.status(200).json(coords)
            }else{
                res.status(404).json(`Couldn't find coordnates with name: ${req.params.name}`)
            }
        }catch(err){
            console.log(err)
            switch(err.message){
                case "WORLD_NOT_FOUND":
                    res.status(404).json(`Couldn't find world with id: ${world_id}`)
                    break
                case "DUPE_NAME":
                    res.status(403).json(`Name already taken in world: ${req.params.name}`)
                    break;
                default:
                    res.status(500).json({message: `Unexpected server error while updating coords to a world`})
                    break
            } 
        }
    }
    /**
     * Sends a message of the result of the deletion
     * @param req Contains id from the url relating to a world
     * @param res Sends a message of the result of the deletion
     */
    async deleteWorld(req : Request, res: Response): Promise<void>{
        const world_id = parseInt(req.params.id)
        try{
            const hasDeleted : boolean = await this.worldModel.deleteWorld(world_id)
            if(hasDeleted){
                res.status(204).json({message: "Deleted World"})
            }else{
                res.status(404).json(`Couldn't find world with ID: ${world_id}`)
            }
        }catch(err){
            switch(err.message){
            
                default:
                    res.status(500).json({message: `Unexpected server error while deleting a world`})
                    break
            } 
        }
    }
    /**
     * Sends a message of the result of the deletion
     * @param req Contains id from the url relating to a world, and fields containing the user email and role
     * @param res Sends a message of the result of the deletion
     */
    async removeUserFromWorld(req : Request, res: Response): Promise<void>{
        const world_id = parseInt(req.params.id)
        try{
            const hasDeleted : boolean = await this.worldModel.removeUserFromWorld(world_id, req.body)
            if(hasDeleted){
                res.status(204).json({message: "Removed User"})
            }else{
                res.status(404).json(`Can't find world with ID: ${world_id}`)
            }
        }catch(err){
            switch(err.message){
                case "USER_NOT_FOUND":
                    res.status(404).json(`Can't find user in given world with email: ${req.body.user_email}`)
                    break
                case "CANT_REMOVE_ADMIN":
                    res.status(403).json({message: "Can't remove an admin unless you delete the world!"})
                    break
                default:
                    res.status(500).json({message: `Unexpected server error while removing a user from a world`})
                    break
            } 
        }
    }
    /**
     * Sends a message of the result of the deletion
     * @param req Contains name and world id from the url relating to coords
     * @param res Sends a message of the result of the deletion
     */
    async deleteCoords(req : Request, res: Response): Promise<void>{
        const world_id = parseInt(req.params.id)
        try{
            const hasDeleted : boolean = await this.worldModel.deleteCoords(world_id, req.params.name)
            if(hasDeleted){
                res.status(204).json({message: "Deleted Coords"})
            }else{
                res.status(404).json({message: `Couldn't find coordnates with from world with name: ${req.body.coord_name}`})
            }
        }catch(err){
            switch(err.message){
                case "WORLD_NOT_FOUND":
                    res.status(404).json(`Couldn't find coordnates with from world: ${world_id}`)
                    break;
                default:
                    res.status(500).json({message: `Unexpected server error while deleting coords`})
                    break
            } 
        }
    }
}
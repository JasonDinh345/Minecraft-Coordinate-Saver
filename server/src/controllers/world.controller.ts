import { Request, Response } from 'express';
import {UserWorldRoles, World, WorldCoords} from '@/types/world/world.type'
import { WorldModel } from '@/models/world.model';

export class WorldController{
    private worldModel : WorldModel

    constructor(worldModel: WorldModel){
        this.worldModel = worldModel
    }
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
    async getAllUsersInAWorld(req : Request, res: Response): Promise<void>{
        const world_id = parseInt(req.params.id)
        try{
            const users : { username: string, role_name: string }[] = await this.worldModel.getAllUsersInAWorld(world_id)
            if(users){
                res.status(200).json(users)
            }else{
                res.status(404).json({message:`Can't find world with ID: ${world_id}`})
            }
        }catch(err){
            console.log(err)
            res.status(500).json({message: `Unexpected server error while getting world with ID: ${world_id}`})
        }

    }
    async getAllCoordsInAWorld(req : Request, res: Response): Promise<void>{
        const world_id = parseInt(req.params.id)
        try{
            const coords : WorldCoords[] = await this.worldModel.getAllCoordsInAWorld(world_id)
            if(coords){
                res.status(200).json(coords)
            }else{
                res.status(404).json({message:`Can't find world with ID: ${world_id}`})
            }
        }catch(err){
            res.status(500).json({message: `Unexpected server error while getting world with ID: ${world_id}`})
        }
    }
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
    async addUserToWorld(req : Request, res: Response): Promise<void>{
        const world_id = parseInt(req.params.id)
        try{
            const userWorldRoles : UserWorldRoles = await this.worldModel.addUserToWorld(world_id, req.body)
            if(userWorldRoles){
                res.status(201).json({message: "Successfull added user to server!"})
            }else{
                res.status(500).json({message: `Unexpected server error while adding user to world`})
            }
        }catch(err){
            if(err.code == 23503){
                res.status(404).json(`Couldn't find a user, world, or role with given IDs`)
            }
            switch(err.message){
                case "NULL_IDS":
                    res.status(400).json({message: "IDs must be not null"})
                    break;
                default:
                    res.status(500).json({message: `Unexpected server error while adding user to world`})
                    break
            } 
        }
   }
    async addNewCoordToWorld(req : Request, res: Response): Promise<void>{
        const world_id = parseInt(req.params.id)
        try{
            const coords : WorldCoords = await this.worldModel.addNewCoordToWorld(world_id, req.body)
            if(coords){
                res.status(201).json(coords)
            }else{
                res.status(500).json({message: `Unexpected server error while adding coords to world`})
            }
        }catch(err){
            if(err.code == 23503){
                res.status(404).json(`Couldn't find world with ID: ${world_id}`)
            }
            switch(err.message){
                case "INVALID_FIELDS":
                    res.status(400).json({message: "Fields must be not null"})
                    break;
                default:
                    res.status(500).json({message: `Unexpected server error while adding coords to world`})
                    break
            } 
        }
    }
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
            if(err.code == 23503){
                res.status(404).json(`Couldn't find a user, world, or role with given IDs`)
            }
            switch(err.message){
                case "NULL_IDS":
                    res.status(400).json({message: "IDs must be not null"})
                    break;
                default:
                    res.status(500).json({message: `Unexpected server error while updating user role`})
                    break
            } 
        }
    }
    async updateCoords(req : Request, res: Response): Promise<void>{
        const world_coord_id = parseInt(req.params.id)
        try{
            const coords : WorldCoords = await this.worldModel.updateCoords(world_coord_id, req.body)
            if(coords){
                res.status(200).json(coords)
            }else{
                res.status(404).json(`Couldn't find coordnates with ID: ${world_coord_id}`)
            }
        }catch(err){
            switch(err.message){
                default:
                    res.status(500).json({message: `Unexpected server error while updating coords to a world`})
                    break
            } 
        }
    }
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
    async removeUserFromWorld(req : Request, res: Response): Promise<void>{
        const world_id = parseInt(req.params.id)
        try{
            const hasDeleted : boolean = await this.worldModel.removeUserFromWorld(world_id, req.body)
            if(hasDeleted){
                res.status(204).json({message: "Removed User"})
            }else{
                res.status(404).json(`Can't find user in given world!`)
            }
        }catch(err){
            switch(err.message){
                case "CANT_REMOVE_ADMIN":
                    res.status(403).json({message: "Can't remove an admin unless you delete the world!"})
                default:
                    res.status(500).json({message: `Unexpected server error while removing a user from a world`})
                    break
            } 
        }
    }
    async deleteCoords(req : Request, res: Response): Promise<void>{
        const world_coord_id = parseInt(req.params.id)
        try{
            const hasDeleted : boolean = await this.worldModel.deleteCoords(world_coord_id)
            if(hasDeleted){
                res.status(204).json({message: "Deleted Coords"})
            }else{
                res.status(404).json(`Couldn't find coordnates with ID: ${world_coord_id}`)
            }
        }catch(err){
            switch(err.message){
            
                default:
                    res.status(500).json({message: `Unexpected server error while deleting coords`})
                    break
            } 
        }
    }
}
import {Pool} from 'pg'
import {UserWorldRoles, World} from '@/types/world/world.type'


export class WorldModel{
    private pool:Pool

    constructor(pool : Pool){
        this.pool = pool
    }
    async getWorld(id : number): Promise<World>{
        const result = await this.pool.query("SELECT * FROM worlds WHERE id = 1$", [id])
        return result.rows[0] || null
    }
    async getAllWorldsMatchingUser(user_id :number): Promise<World[]>{
        try{
            const result = await this.pool.query("SELECT w.id, w.name, w.created_at, w.last_updated, w.seed " +  
                "FROM user_world_roles usr " +
                "JOIN worlds w ON usr.world_id = w.id " +
                "JOIN users u ON usr.user_id = u.id WHERE u.id = $1;", [user_id])
            return result.rows || null 
        }catch(err){
            throw new Error("SERVER_ERROR")
        }
        
    }
    async getAllUsersInWorld(world_id: number):Promise<{ username: string, role_name: string }[]>{
        try{
            const result = await this.pool.query("SELECT u.username, r.role_name " +
                "FROM user_world_roles usr " +
                "JOIN users u on usr.user_id = u.id " +
                "JOIN worlds w on usr.world_id = w.id WHERE w.id = $1;", [world_id])
            return result.rows || null 
        }catch(err){
            throw new Error("SERVER_ERROR")
        }
        
    }
    async createNewWorld(worldData: Omit<World, 'created_at' | 'last_updated'>){
        if(!worldData || !worldData.name){
            throw new Error("INVALID_FIELD")
        }
        try{
            const result = await this.pool.query("INSERT INTO worlds (name, seed) VALUES ($1, $2);", [worldData.name, worldData.seed])
            return result.rows[0] || null
        }catch(err){
            throw new Error("SERVER_ERROR")
        }
        
    }
    async addUserToWorld(userWorldRoles: UserWorldRoles): Promise<UserWorldRoles>{
        if(Object.values(userWorldRoles).includes(null)){
            throw new Error("NULL_IDS")
        }
        try{
            const result = await this.pool.query("INSERT INTO user_world_roles (user_id, world_id, role_id) VALUES ($1, $2, $3);", [userWorldRoles.user_id, 
                userWorldRoles.world_id,
                 userWorldRoles.role_id])
            return result.rows[0] || null
        }catch(err){
            throw new Error("SERVER_ERROR")
        }
        
    }
    async updateWorldData(world_id: number, worldData : Partial<World>): Promise<World>{
        const filteredData = Object.fromEntries(
            Object.entries(worldData)
            .filter(([key, value])=> value !== undefined && value !== null && value !== '' && key !== 'id' && key !== 'created_at' && key !== 'last_updated'))
        const fields = Object.values(filteredData).map((key, index)=> `${key} = $${index + 2}`).join(", ") + `last_updated = CURRENT_TIMESTAMP ` ;
        try{
            const result = await this.pool.query(`UPDATE worlds SET ${fields} WHERE world_id = $1;`, [world_id, ...Object.values(filteredData)])
            return result.rows[0] || null
        }catch(err){
            throw new Error("SERVER_ERROR")
        }
        
    }
    async updateUserRole(updatedUserWorldRoles: UserWorldRoles):Promise<UserWorldRoles>{
        if(Object.values(updatedUserWorldRoles).includes(null)){
            throw new Error("NULL_IDS")
        }
        try{
            const result = await this.pool.query("UPDATE worlds SET role_id = $1 WHERE world_id = $2 AND user_id = $2", [updatedUserWorldRoles.role_id,
                                                                                                                        updatedUserWorldRoles.world_id,
                                                                                                                        updatedUserWorldRoles.user_id])
            return result.rows[0] || null
        }catch(err){
            throw new Error("SERVER_ERROR")
        }
    }
    async deleteWorld(world_id: number): Promise<boolean>{
        try{
            const result = await this.pool.query("DELETE FROM worlds WHERE id = $1;", [world_id])
            return result.rowCount > 0;
        }catch(err){
            throw new Error("SERVER_ERROR")
        }
    }
    async deleteUserFromWorld(userWorldRoles: UserWorldRoles):  Promise<boolean>{
        if(userWorldRoles.role_id == 1){
            throw new Error("CANT_REMOVE_ADMIN")
        }
        try{
            const result = await this.pool.query("DELETE FROM user_world_roles WHERE world_id = $1 AND user_id = $2;", [userWorldRoles.world_id, userWorldRoles.user_id])
            return result.rowCount > 0;
        }catch(err){
            throw new Error("SERVER_ERROR")
        }
    }
}
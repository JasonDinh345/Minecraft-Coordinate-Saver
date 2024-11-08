import {Pool} from 'pg'
import {UserWorldRoles, World, WorldCoords} from '@/types/world/world.type'


export class WorldModel{
    private pool:Pool

    constructor(pool : Pool){
        this.pool = pool
    }
    async getWorld(id : number): Promise<World>{
        const result = await this.pool.query("SELECT * FROM worlds WHERE id = $1;", [id])
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
    async getAllUsersInAWorld(world_id: number):Promise<{ username: string, role_name: string }[]>{
        try{
            const result = await this.pool.query("SELECT u.username, r.role_name " +
                "FROM user_world_roles usr " +
                "JOIN users u on usr.user_id = u.id " +
                "JOIN roles r on usr.role_id = r.role_id " +
                "JOIN worlds w on usr.world_id = w.id WHERE w.id = $1;", [world_id])
            return result.rows || null 
        }catch(err){
            console.log(err)
            throw new Error("SERVER_ERROR")
        }
        
    }
    async getAllCoordsInAWorld(world_id: number):Promise<WorldCoords[]>{
        try{
            const result = await this.pool.query("SELECT * FROM world_coords WHERE world_id = $1", [world_id])
            return result.rows || null
        }catch(err){
            throw new Error("SERVER_ERROR")
        }
    }
    async createNewWorld(worldData: Omit<World, 'created_at' | 'last_updated'>): Promise<World>{
        if(!worldData || !worldData.name){
            throw new Error("INVALID_FIELD")
        }
        try{
            const result = await this.pool.query("INSERT INTO worlds (name, seed) VALUES ($1, $2) RETURNING *;", [worldData.name, worldData.seed])
            return result.rows[0] || null
        }catch(err){
            throw new Error("SERVER_ERROR")
        }
        
    }
    async addUserToWorld(world_id: number, userWorldRoles: Omit<UserWorldRoles, 'world_id'>): Promise<UserWorldRoles>{
        if(Object.values(userWorldRoles).includes(null)){
            throw new Error("NULL_IDS")
        }
        try{
            const result = await this.pool.query("INSERT INTO user_world_roles (user_id, world_id, role_id) VALUES ($1, $2, $3) RETURNING *;", 
                [userWorldRoles.user_id, 
                world_id,
                userWorldRoles.role_id])
            return result.rows[0] || null
        }catch(err){
            throw new Error("SERVER_ERROR")
        }
        
    }

   
    async addNewCoordToWorld(world_id: number, coordData: Omit<WorldCoords, 'id'>):Promise<WorldCoords>{
        if(!(Object.values(Object.fromEntries(Object.entries(coordData).filter(([key]) => key !== "z_coord"))).every(value => value !== null && value !== undefined))){
            throw new Error("INVALID_FIELDS")
        }
        try{
            const result = await this.pool.query(`INSERT INTO world_coords (world_id, name, x_coord, y_coord, z_coord) VALUES ($1, $2, $3, $4, $5) RETURNING *;`,
                [world_id,
                coordData.name,
                coordData.x_coord,
                coordData.y_coord, 
                coordData.z_coord || null ])
            if(result.rows[0]){
                await this.updateWorldData(world_id, {})
                return result.rows[0]
            }
            return null;
        }catch(err){
            throw new Error("SERVER_ERROR")
        }
    }
    async updateWorldData(world_id: number, worldData : Partial<World>): Promise<World>{
        const filteredData = Object.fromEntries(
            Object.entries(worldData)
            .filter(([key, value])=> value !== undefined && value !== null && value !== '' && key !== 'id' && key !== 'created_at' && key !== 'last_updated'))
        const fields = Object.keys(filteredData).map((key, index)=> `${key} = $${index + 2}`).join(", ") ;
        try{
            const result = await this.pool.query(`UPDATE worlds SET ${fields}, last_updated = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *;`, [world_id, ...Object.values(filteredData)])
            return result.rows[0] || null
        }catch(err){
            console.log(err)
            throw new Error("SERVER_ERROR")
        }
        
    }
    async updateUserRole(world_id: number, updatedUserWorldRoles: UserWorldRoles):Promise<UserWorldRoles>{
        if(Object.values(updatedUserWorldRoles).includes(null)){
            throw new Error("NULL_IDS")
        }
        try{
            const result = await this.pool.query("UPDATE worlds SET role_id = $1 WHERE world_id = $2 AND user_id = $3 RETURNING *", 
                [updatedUserWorldRoles.role_id,
                world_id,
                updatedUserWorldRoles.user_id])
            return result.rows[0] || null
        }catch(err){
            throw new Error("SERVER_ERROR")
        }
    }
    async updateCoords(world_coord_id: number, updateCoords: Partial<WorldCoords>): Promise<WorldCoords>{
        const filteredData = Object.fromEntries(
            Object.entries(updateCoords)
            .filter(([key, value])=> value !== undefined && value !== null && value !== '' && key !== 'world_coord_id' && key !== 'world_id'))
        const fields = Object.values(filteredData).map((key, index)=> `${key} = $${index + 2}`).join(", ") ;
        try{
            const result = await this.pool.query(`UPDATE worlds SET ${fields} WHERE world_coord_id = $1 RETURNING *;`, [world_coord_id, ...Object.values(filteredData)])
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
    async removeUserFromWorld(world_id: number, userWorldRoles: UserWorldRoles):  Promise<boolean>{
        if(userWorldRoles.role_id == 1){
            throw new Error("CANT_REMOVE_ADMIN")
        }
        try{
            const result = await this.pool.query("DELETE FROM user_world_roles WHERE world_id = $1 AND user_id = $2;", [world_id, userWorldRoles.user_id])
            return result.rowCount > 0;
        }catch(err){
            throw new Error("SERVER_ERROR")
        }
    }
    async deleteCoords(world_coord_id: number){
        try{
            const result = await this.pool.query("DELETE FROM world_coords WHERE world_coord_id = $1", [world_coord_id ])
            return result.rowCount > 0;
        }catch(err){
            throw new Error("SERVER_ERROR")
        }
    }
}
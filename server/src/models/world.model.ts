import {Pool} from 'pg'
import {UserWorldRoles, World, WorldCoords, UserRoleQuery} from '@/types/world/world.type'
import { error } from 'node:console'

/**
 * Model for World Route
 */
export class WorldModel{
    /** Connection to DB */
    private pool:Pool
    /**
     * Constructs WorldModel
     * @param pool connection to DB
     */
    constructor(pool : Pool){
        this.pool = pool
    }
    /**
     * Given an id, it finds a given world
     * @param id number relating to a world
     * @returns the world if found, null if else
     */
    async getWorld(id : number): Promise<World>{
        const result = await this.pool.query("SELECT * FROM worlds WHERE id = $1;", [id])
        return result.rows[0] || null
    }
    /**
     * Gets all users in a world
     * @param world_id number relating to a world
     * @returns an array of users
     */
    async getAllUsersInAWorld(world_id: number):Promise<{ username: string, role_name: string }[]>{
        let result;
        try{
             result = await this.pool.query("SELECT u.username, r.role_name " +
                "FROM user_world_roles usr " +
                "JOIN users u on usr.user_id = u.id " +
                "JOIN roles r on usr.role_id = r.role_id " +
                "JOIN worlds w on usr.world_id = w.id WHERE w.id = $1;", [world_id])
        }catch(err){
            console.log(err)
            throw new Error("SERVER_ERROR")
        }
        if(result.rowCount === 0){
            throw new Error("INVALID_ID")
        }
        return result.rows
        
    }
    /**
     * Gets all coords in a world
     * @param world_id number relating to a world
     * @returns an array of coords
     */
    async getAllCoordsInAWorld(world_id: number):Promise<WorldCoords[]>{
        const checkIdResult = await this.pool.query("SELECT 1 FROM worlds WHERE id = $1", [world_id]);
        if (checkIdResult.rowCount === 0) {
            throw new Error("INVALID_ID");
        }
        try{
            const result = await this.pool.query("SELECT * FROM world_coords WHERE world_id = $1", [world_id])
            return result.rows 
        }catch(err){
            throw new Error("SERVER_ERROR")
        }
    }
    /**
     * Inserts new world into DB
     * @param worldData fields relating to a world
     * @returns the newly created world if successful
     */
    async createNewWorld(worldData: Omit<World, 'created_at' | 'last_updated'>): Promise<World>{
        if(!worldData || !worldData.name){
            throw new Error("INVALID_FIELD")
        }
        try{
            const result = await this.pool.query("INSERT INTO worlds (name, seed) VALUES ($1, $2) RETURNING *;", [worldData.name, worldData.seed])
            return result.rows[0] || null
        }catch(err){
            console.log(err)
            throw new Error("SERVER_ERROR")
        }
        
    }
    /**
     * Adds a user, world, and role relationship to DB
     * @param world_id fields relating to a world
     * @param userRoleQuery, email of user and role name
     * @returns the user query if successful
     */
    async addUserToWorld(world_id: number, userRoleQuery: UserRoleQuery): Promise<UserRoleQuery>{
         const userRoleQueryValues  = Object.values(userRoleQuery)
        if(userRoleQueryValues.includes(null) || userRoleQueryValues.includes(undefined) || userRoleQueryValues.includes("")){
            throw new Error("INVALID_FIELDS")
        }
        try{
            const userResult = await this.pool.query("SELECT id FROM users WHERE email = $1", [userRoleQuery.user_email]);
            if (userResult.rowCount === 0) {
                throw new Error("USER_NOT_FOUND");
            }
            const roleResult = await this.pool.query("SELECT role_id FROM roles WHERE role_name = $1", [userRoleQuery.role_name]);
            if (roleResult.rowCount === 0) {
                throw new Error("ROLE_NOT_FOUND");
            }
            const result = await this.pool.query(`INSERT INTO user_world_roles (user_id, world_id, role_id) 
             VALUES ($1, $2, $3)
             ON CONFLICT (user_id, world_id, role_id) DO NOTHING
             RETURNING *;`,
                [userResult.rows[0].id,
                world_id,
                roleResult.rows[0].role_id])
            return result.rows[0] ? {user_email : userRoleQuery.user_email, role_name:userRoleQuery.role_name} : null
        }catch(err){
            console.log(err)
            throw new Error(err.message)
        }
        
    }

    /**
     * Adds a coordninate, world relationship into the db
     * @param world_id number relating to a world
     * @param coordData, coordnaites to a world with a name
     * @returns newly added coords, null if id not found
     */
    async addNewCoordToWorld(world_id: number, coordData: Omit<WorldCoords, 'id'>):Promise<WorldCoords>{
        if(!(Object.values(Object.fromEntries(Object.entries(coordData).filter(([key]) => key !== "z_coord")))
            .every(value => value !== null && value !== undefined && value !== "") )){
            throw new Error("INVALID_FIELDS")
        }
        try{
            const result = await this.pool.query(`INSERT INTO world_coords (world_id, name, x_coord, y_coord, z_coord, description) 
                VALUES ($1, $2, $3, $4, $5, $6) 
                ON CONFLICT (world_id, name) DO NOTHING
                RETURNING *;`,
                [world_id,
                coordData.name,
                coordData.x_coord,
                coordData.y_coord, 
                coordData.z_coord || null,
                coordData.description || null])
            if(result.rows[0]){
                await this.updateWorldData(world_id, {})
                return result.rows[0]
            }
            return null;
        }catch(err){
            console.log(err)
            if(err.code === '23503'){
                throw new Error("INVALID_ID")
            }
            throw new Error(err.message)
        }
    }
    /**
     * Updates world data in db
     * @param world_id number relating to a world 
     * @param worldData updated fields
     * @returns Updated world data, null if id not found
     */
    async updateWorldData(world_id: number, worldData : Partial<World>): Promise<World>{
        const filteredData = Object.fromEntries(
            Object.entries(worldData)
            .filter(([key, value])=> value !== undefined && value !== null && value !== '' && key !== 'id' && key !== 'created_at' && key !== 'last_updated'))
        const fields = Object.keys(filteredData).map((key, index)=> `${key} = $${index + 2}`).join(", ") ;
        const fieldsWithLastUpdated = fields ? `${fields}, last_updated = CURRENT_TIMESTAMP` : `last_updated = CURRENT_TIMESTAMP`;
        console.log(fields)
        try{
            const result = await this.pool.query(`UPDATE worlds SET ${fieldsWithLastUpdated} WHERE id = $1 RETURNING *;`, [world_id, ...Object.values(filteredData)])
            return result.rows[0] || null
        }catch(err){
            console.log(err)
            throw new Error(err.message)
        }
        
    }
    /**
     * Updates user's role in a world
     * @param world_id number relating to a world 
     * @param userRoleQuery contains the email of the user and the updated role
     * @returns the email of the user and the updated role, null if not found
     */
    async updateUserRole(world_id: number, userRoleQuery: UserRoleQuery):Promise<UserWorldRoles>{
        const userRoleQueryValues  = Object.values(userRoleQuery)
        if(userRoleQueryValues.includes(null) || userRoleQueryValues.includes(undefined) || userRoleQueryValues.includes("")){
            throw new Error("INVALID_FIELDS")
        }
        try{
            const userResult = await this.pool.query("SELECT id FROM users WHERE email = $1", [userRoleQuery.user_email]);
            if (userResult.rowCount === 0) {
                throw new Error("USER_NOT_FOUND");
            }
            const roleResult = await this.pool.query("SELECT role_id FROM roles WHERE role_name = $1", [userRoleQuery.role_name]);
            if (roleResult.rowCount === 0) {
                throw new Error("ROLE_NOT_FOUND");
            }
            const result = await this.pool.query(`UPDATE user_world_roles 
                SET role_id = $1
                WHERE user_world_roles.user_id = $2 AND user_world_roles.world_id = $3 
                RETURNING *;`,
                [roleResult.rows[0].role_id,
                userResult.rows[0].id,
                world_id])
            
            return result.rows[0] || null
        }catch(err){
            console.log(err)
            throw new Error(err.message)
        }
    }
    /**
     * Updates the coordinates from a world
     * @param world_coord_id id relating to coords
     * @param updateCoords updated fields for coords
     * @returns The updated coords, null if not found
     */
    async updateCoords(world_coord_name: string, updateCoords: Partial<WorldCoords>): Promise<WorldCoords>{
        const existingCoords = await this.pool.query(`SELECT world_id FROM world_coords WHERE name = $1;`, [world_coord_name])
        if(!existingCoords.rows[0]){
            throw new Error("COORDS_NOT_FOUND")
        }
        const filteredData = Object.fromEntries(
            Object.entries(updateCoords)
            .filter(([key, value])=> value !== undefined && value !== null && value !== '' && key !== 'world_coord_id' && key !== 'world_id'))
       
        if(filteredData.name){
            const checkConflit = await this.pool.query("SELECT * FROM world_coords WHERE name = $1 AND world_id = $2;", 
                [filteredData.name, existingCoords.rows[0].world_id])
            if(checkConflit.rows[0]){
                throw new Error("DUPE_NAME")
            }
        }
        const fields = Object.entries(filteredData).map(([key], index)=> `${key} = $${index + 3}`).join(", ") ;
        try{
            const result = await this.pool.query(`UPDATE world_coords 
                SET ${fields} 
                WHERE name = $1 AND world_id = $2 
                RETURNING *;`, 
                [world_coord_name.trim(), 
                    existingCoords.rows[0].world_id,
                    ...Object.values(filteredData)])
                if(result.rows[0]){
                    await this.updateWorldData(existingCoords.rows[0].world_id, {})
                    return result.rows[0]
                }
                return null
        }catch(err){
            console.log(err)
            throw new Error(err.message)
        }
    }
    /**
     * Deletes a world from the db
     * @param world_id id relating to a world
     * @returns A boolean if the world has been deleted or not
     */
    async deleteWorld(world_id: number): Promise<boolean>{
        try{
            const result = await this.pool.query("DELETE FROM worlds WHERE id = $1 RETURNING *;", [world_id])
            return result.rowCount > 0;
        }catch(err){
            console.log(err)
            throw new Error("SERVER_ERROR")
        }
    }
    /**
     * Removes a user from a world 
     * @param world_id id relating to a world
     * @param userWorldRoles user, role,
     * @returns A boolean if the user has been removed or not
     */
    async removeUserFromWorld(world_id: number, userRoleQuery: UserRoleQuery):  Promise<boolean>{
        if(userRoleQuery.role_name == "ADMIN"){
            throw new Error("CANT_REMOVE_ADMIN")
        }
        const userResult = await this.pool.query("SELECT id FROM users WHERE email = $1", [userRoleQuery.user_email]);
        if (userResult.rowCount === 0) {
            throw new Error("USER_NOT_FOUND");
        }
        try{
            const result = await this.pool.query("DELETE FROM user_world_roles WHERE world_id = $1 AND user_id = $2 RETURNING *;", 
                [world_id, userResult.rows[0].id])
            return result.rowCount > 0;
        }catch(err){
            console.log(err)
            throw new Error(err.message)
        }
    }
    /**
     * Removes coords from a world
     * @param world_coord_id id relating to coords
     * @returns A boolean if the coords has been removed or not
     */
    async deleteCoords(world_coord_name: string){
        const existingCoords = await this.pool.query(`SELECT world_id FROM world_coords WHERE name = $1;`, [world_coord_name])
        if(!existingCoords.rows[0]){
            throw new Error("COORDS_NOT_FOUND")
        }
        try{
            const result = await this.pool.query(`DELETE FROM world_coords 
                WHERE world_coord_name = $1 
                AND world_id = $2
                RETURNING *`, [world_coord_name, existingCoords.rows[0].world_id])
            return result.rowCount > 0;
        }catch(err){
            console.log(err)
            throw new Error("SERVER_ERROR")
        }
    }
}
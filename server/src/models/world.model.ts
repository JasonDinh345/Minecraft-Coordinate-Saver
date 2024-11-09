import {Pool} from 'pg'
import {UserWorldRoles, World, WorldCoords, UserRoleQuery} from '@/types/world/world.type'

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
    /**
     * Gets all coords in a world
     * @param world_id number relating to a world
     * @returns an array of coords
     */
    async getAllCoordsInAWorld(world_id: number):Promise<WorldCoords[]>{
        try{
            const result = await this.pool.query("SELECT * FROM world_coords WHERE world_id = $1", [world_id])
            return result.rows || null
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
            const result = await this.pool.query(`INSERT INTO user_world_roles (user_id, world_id, role_id) 
            VALUES ((SELECT id FROM users WHERE email = $1), $2, (SELECT role_id FROM roles WHERE role_name = $3))
            RETURNING *;`,
                [userRoleQuery.user_email,
                world_id,
                userRoleQuery.role_name])
            return result.rows[0] ? {user_email : userRoleQuery.user_email, role_name:userRoleQuery.role_name} : null
        }catch(err){
            console.log(err)
            throw new Error("SERVER_ERROR")
        }
        
    }

    /**
     * Adds a coordninate, world relationship into the db
     * @param world_id number relating to a world
     * @param coordData, coordnaites to a world with a name
     * @returns newly added coords, null if id not found
     */
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
            console.log(err)
            throw new Error("SERVER_ERROR")
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
        try{
            const result = await this.pool.query(`UPDATE worlds SET ${fields}, last_updated = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *;`, [world_id, ...Object.values(filteredData)])
            return result.rows[0] || null
        }catch(err){
            console.log(err)
            throw new Error("SERVER_ERROR")
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
            const result = await this.pool.query("UPDATE user_world_roles SET role_id = roles.role_id FROM users, roles ",
                "WHERE user_world_roles.user_id = users.id ",
                "AND users.email = $1 AND roles.role_name = $2 ",
                "AND user_world_roles.world_id = $3 RETURNING *", 
                [userRoleQuery.user_email,
                    userRoleQuery.role_name,
                world_id])
            return result.rows[0] || null
        }catch(err){
            console.log(err)
            throw new Error("SERVER_ERROR")
        }
    }
    /**
     * Updates the coordinates from a world
     * @param world_coord_id id relating to coords
     * @param updateCoords updated fields for coords
     * @returns The updated coords, null if not found
     */
    async updateCoords(world_coord_id: number, updateCoords: Partial<WorldCoords>): Promise<WorldCoords>{
        const filteredData = Object.fromEntries(
            Object.entries(updateCoords)
            .filter(([key, value])=> value !== undefined && value !== null && value !== '' && key !== 'world_coord_id' && key !== 'world_id'))
        const fields = Object.values(filteredData).map((key, index)=> `${key} = $${index + 2}`).join(", ") ;
        try{
            const result = await this.pool.query(`UPDATE worlds SET ${fields} WHERE world_coord_id = $1 RETURNING *;`, [world_coord_id, ...Object.values(filteredData)])
            return result.rows[0] || null
        }catch(err){
            console.log(err)
            throw new Error("SERVER_ERROR")
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
        try{
            const result = await this.pool.query("DELETE FROM user_world_roles WHERE world_id = $1 AND user_id = (SELECT u.id from users WHERE u.user_email = $2) RETURNING *;", 
                [world_id, userRoleQuery.user_email])
            return result.rowCount > 0;
        }catch(err){
            console.log(err)
            throw new Error("SERVER_ERROR")
        }
    }
    /**
     * Removes coords from a world
     * @param world_coord_id id relating to coords
     * @returns A boolean if the coords has been removed or not
     */
    async deleteCoords(world_coord_id: number){
        try{
            const result = await this.pool.query("DELETE FROM world_coords WHERE world_coord_id = $1 RETURNING *", [world_coord_id ])
            return result.rowCount > 0;
        }catch(err){
            console.log(err)
            throw new Error("SERVER_ERROR")
        }
    }
}
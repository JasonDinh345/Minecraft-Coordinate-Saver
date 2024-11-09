/**
 * Object for World Data
 */
export interface World {
    id: number,
    seed?: string,
    created_at: Date,
    last_updated: Date
    name: string
}
/**
 * Object for Role
 */
export interface Role{
    role_id: number
    role: string
}
/**
 * Object for the user, world, role relationship
 */
export interface UserWorldRoles{
    user_id: number,
    role_id: number,
    world_id: number
}
/**
 * Object for coords in a world
 */
export interface WorldCoords{
    world_id : number
    x_coord :  number
    y_coord: number
    z_coord? : number
    name: string
    description?: string
}
/**
 * Query for updating/adding a user's role 
 */
export interface UserRoleQuery{
    user_email: string,
    role_name: string
}
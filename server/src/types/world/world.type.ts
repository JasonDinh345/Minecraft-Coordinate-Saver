export interface World {
    id: number,
    seed?: string,
    created_at: Date,
    last_updated: Date
    name: string
}
export interface Role{
    role_id: number
    role: string
}
export interface UserWorldRoles{
    user_id: number,
    role_id: number,
    world_id: number
}
export interface WorldCoords{
    world_id : number
    x_coord :  number
    y_coord: number
    z_coord? : number
    name: string
    description: string
}
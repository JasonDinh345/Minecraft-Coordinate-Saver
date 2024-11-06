import {Pool} from 'pg'
import {User} from '@/types/user/user.type'
import bcrypt from 'bcrypt'
/**
 * Connection to Auth DB
 */
export class AuthModel{
    /** Connection to DB */
    private pool :Pool;
    /**
     * Constructs auth model object
     * @param pool connection to db
     */
    constructor(pool : Pool){
        this.pool = pool
    }
    /**
     * Authenticatates user if correct pass and username
     * @param userData, fields to be authenticated 
     * @returns an AuthResult(boolean, message?, user?) to see if the authetication 
     * passed or not, passes the user if successful
     */
    async authenticateUser(userData: Partial<User>): Promise<User>{
        if(!userData.username || !userData.password){
        throw new Error("INVALID_FIELDS")
        }
        const user = (await this.pool.query("SELECT * FROM users WHERE username = $1", [userData.username])).rows[0] || null;
        if(!user){
        throw new Error("INVALID_FIELDS")
        }
        try{
            if(await bcrypt.compare(userData.password, user.password)){
                return user
            }
            throw new Error("INCORRECT_PASSWORD")
        }catch(err){
            console.error("Authentication error: ", err.message)
            throw new Error("SERVER_ERROR")
        }
    }
    /**
     * Adds the newly generated refresh token in the db
     * @param refreshToken, token to generate a new access token
     */
    async addRefreshToken(refreshToken: string): Promise<void>{
        await this.pool.query("INSERT INTO refresh_tokens (refresh_token) VALUES ($1)",[refreshToken])
    }
    /**
     * Checks if the refresh token is valid or not
     * @param refreshToken , token to generate a new access token
     * @returns true if in the db, false if not
     */
    async verifyRefreshToken(refreshToken: string): Promise<boolean>{
        if(!refreshToken){
            throw new Error("INVALID_TOKEN")
        }else if(!(await this.pool.query("SELECT * FROM refresh_tokens WHERE refresh_token = $1", [refreshToken]).rows[0])){
            return false
        }
        return true
    }
    /**
     * Removes the refresh token from the db
     * Unauthenticates the refresh token
     * @param refreshToken , token to generate a new access token
     * @returns true if delete, false if else
     */
    async deleteRefreshToken(refreshToken: string):Promise<boolean>{
        const result = await this.pool.query('DELETE FROM refresh_tokens WHERE refresh_token = $1', [refreshToken])
        return result.rowCount > 0;
    }
}
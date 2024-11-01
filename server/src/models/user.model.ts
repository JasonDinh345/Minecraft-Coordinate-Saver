import {Pool} from 'pg'
import {User, AuthResult} from '../types/user/user.type'
import {Result} from "../types/types"
import bcrypt from 'bcrypt'
/**
 * Model for Users
 */
export class UserModel{
    private pool :Pool;
    /**
     * DB connection 
     * @param thePool, PostgreSQL DB connection
     */
    constructor(thePool :Pool){
        this.pool = thePool;
    }
}
/**
 * @returns all Users in the DB
 */
async function getAllUsers(): Promise<User[] | null>{
    const result = await this.pool.query('SELECT * FROM users');
    return result.rows || null;
}
/**
 * Finds user with given id
 * @param id, number relating to desired user
 * @returns the user with the given id, null if not found
 */
async function getUserByID(id :number): Promise<User | null>{
    const result = await this.pool.query('SELECT * FROM users WHERE id = $1', [id]);
    return result.rows[0] || null; 
}
/**
 * Finds user with given username
 * @param username string relating to desired user
 * @returns the user with the given username, null if not found
 */
async function getUserByUsername(username :string): Promise<User | null>{
    const result = await this.pool.query('SELECT * FROM users WHERE usename = $1', [username]);
    return result.rows[0] || null; 
}
/**
 * Inserts a new user into the DB
 * @param userData, fields to create a new user
 * @returns the new user, null if an error has occured 
 */
async function createNewUser(userData: Omit<User, 'id' | 'created_at'>): Promise<User | null>{
    if (!userData.username || !userData.password || !userData.email) {
        throw new Error("INVALID_FIELD")
    }
    try{
        const hashedPassword: string = await bcrypt.hash(userData.password, 10);
        const result = await this.pool.query('INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING *', [userData.username, userData.email, hashedPassword])
        return result.rows[0] || null
    }catch(err){
        if(err.code === '23505'){
            throw new Error("DUPE_EMAIL")
        }
        throw new Error("SERVER_ERROR")
    }
    
}
/**
 * Updates user with given fields 
 * @param id and number relating to desired user
 * @param userData, fields to be updated 
 * @returns the updated user, null if not found
 */
async function updateUser(id: number, userData: Partial<User>): Promise<User>{
    const fields = Object.keys(userData).filter(key => key == 'id' || key == 'created_at').map((key, index)=> `${key} = $${index + 2}`).join(", ");

    const keys = [id, Object.keys(userData).filter(key => key == 'id' || key == 'created_at')]

    const result = await this.pool.query(`UPDATE users SET ${fields} WHERE id = $1 RETURNING *`, keys);
  
    return result.rows[0] || null; 
}
/**
 * Authenticatates user if correct pass and username
 * @param userData, fields to be authenticated 
 * @returns an AuthResult(boolean, message?, user?) to see if the authetication 
 * passed or not, passes the user if successful
 */
async function authenticateUser(userData: Partial<User>): Promise<AuthResult>{
    if(!userData.username || !userData.password){
        return {success: false, message: "Please enter a valid username and password!"};
    }
    const user = await getUserByUsername(userData.username);
    if(!user){
        return {success: false, message: "Invalid Username!"};
    }
    try{
        if(await bcrypt.compare(userData.password, user.password)){
            return {success: true, user: user};
        }
        return {success: false, message: "Incorrect Password!"};
    }catch(err){
        console.error("Authentication error: ", err.message)
        return {success: false, message:"Server Error!"};
    }

}
/**
 * Deletes given user
 * @param id, number relating to user to be deleted
 * @returns a boolean, true if deleted, false if user not found
 */
async function deleteUser(id: number): Promise<boolean>{
    const result = await this.pool.query('DELETE FROM users WHERE id = $1', [id])
    return result.rowCount > 0;
}
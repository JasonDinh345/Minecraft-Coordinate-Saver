import {Pool} from 'pg'
import {User} from '../types/user/user.type'
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

/**
 * @returns all Users in the DB
 */
async getAllUsers(): Promise<User[] | null>{
    const result = await this.pool.query('SELECT * FROM users');
    return result.rows || null;
}
/**
 * Finds user with given id
 * @param id, number relating to desired user
 * @returns the user with the given id, null if not found
 */
async getUserByID(id :number): Promise<User | null>{
    const result = await this.pool.query('SELECT * FROM users WHERE id = $1', [id]);
    return result.rows[0] || null; 
}
/**
 * Finds user with given username
 * @param username string relating to desired user
 * @returns the user with the given username, null if not found
 */
async getUserByUsername(username :string): Promise<User | null>{
    const result = await this.pool.query('SELECT * FROM users WHERE usename = $1', [username]);
    return result.rows[0] || null; 
}
/**
 * Inserts a new user into the DB
 * @param userData, fields to create a new user
 * @returns the new user, null if an error has occured 
 */
async createNewUser(userData: Omit<User, 'id' | 'created_at'>): Promise<User | null>{
    
    if (!userData.username || !userData.password || !userData.email) {
        throw new Error("INVALID_FIELD")
    }

    try{
        const hashedPassword: string = await bcrypt.hash(userData.password.split(" ").join(""), 10);

        const result = await this.pool.query('INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING *', 
            [userData.username.split(" ").join(""), userData.email.split(" ").join(""), hashedPassword])
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
async updateUser(id: number, userData: Partial<User>): Promise<User | null>{
    const filteredData = Object.fromEntries(
        Object.entries(userData)
            .filter(([key, value]) => value !== undefined && value !== null && value !== '' && key !== 'id' && key !== 'created_at')
    );
    
    if(filteredData.password){
        filteredData.password = await bcrypt.hash(filteredData.password, 10);
    }
    const fields = Object.keys(filteredData).map((key, index)=> `${key} = $${index + 2}`).join(", ");

    const values = [id, ...Object.values(filteredData)]
    try{
        const result = await this.pool.query(`UPDATE users SET ${fields} WHERE id = $1 RETURNING *`, values);
        return result.rows[0] || null; 
    }catch(err){
        if(err.code === '23505'){
            throw new Error("DUPE_EMAIL")
        }
        throw new Error("SERVER_ERROR")
    }
    
}
/**
 * Deletes given user
 * @param id, number relating to user to be deleted
 * @returns a boolean, true if deleted, false if user not found
 */
async deleteUser(id: number): Promise<boolean>{
    const result = await this.pool.query('DELETE FROM users WHERE id = $1', [id])
    return result.rowCount > 0;
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
    const user = await this.getUserByUsername(userData.username);
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
}

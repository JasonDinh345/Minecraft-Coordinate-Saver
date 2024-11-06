import {Pool} from 'pg'
import {User} from '@/types/user/user.type'
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
 * Finds user with given username
 * @param username, username relating to desired user
 * @returns the user with the given id, null if not found
 */
async getUserByEmail(email :string): Promise<User | null>{
    const result = await this.pool.query('SELECT * FROM users WHERE email = $1', [email]);
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
 * @param email, email relating to desired user
 * @param userData, fields to be updated 
 * @returns the updated user, null if not found
 */
async updateUser(email: string, userData: Partial<User>): Promise<User | null>{
    const filteredData = Object.fromEntries(
        Object.entries(userData)
            .filter(([key, value]) => value !== undefined && value !== null && value !== '' && key !== 'id' && key !== 'created_at')
    );
    
    if(filteredData.password){
        filteredData.password = await bcrypt.hash(filteredData.password, 10);
    }
    const fields = Object.keys(filteredData).map((key, index)=> `${key} = $${index + 2}`).join(", ");

    const values = [email, ...Object.values(filteredData)]
    try{
        const result = await this.pool.query(`UPDATE users SET ${fields} WHERE email = $1 RETURNING *`, values);
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
 * @param email, email relating to user to be deleted
 * @returns a boolean, true if deleted, false if user not found
 */
async deleteUser(email: string): Promise<boolean>{
    const result = await this.pool.query('DELETE FROM users WHERE email = $1', [email])
    return result.rowCount > 0;
}

}

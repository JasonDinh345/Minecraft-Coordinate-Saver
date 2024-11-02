"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserModel = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
/**
 * Model for Users
 */
class UserModel {
    /**
     * DB connection
     * @param thePool, PostgreSQL DB connection
     */
    constructor(thePool) {
        this.pool = thePool;
    }
    /**
     * @returns all Users in the DB
     */
    async getAllUsers() {
        const result = await this.pool.query('SELECT * FROM users');
        return result.rows || null;
    }
    /**
     * Finds user with given id
     * @param id, number relating to desired user
     * @returns the user with the given id, null if not found
     */
    async getUserByID(id) {
        const result = await this.pool.query('SELECT * FROM users WHERE id = $1', [id]);
        return result.rows[0] || null;
    }
    /**
     * Finds user with given username
     * @param username string relating to desired user
     * @returns the user with the given username, null if not found
     */
    async getUserByUsername(username) {
        const result = await this.pool.query('SELECT * FROM users WHERE usename = $1', [username]);
        return result.rows[0] || null;
    }
    /**
     * Inserts a new user into the DB
     * @param userData, fields to create a new user
     * @returns the new user, null if an error has occured
     */
    async createNewUser(userData) {
        if (!userData.username || !userData.password || !userData.email) {
            throw new Error("INVALID_FIELD");
        }
        try {
            const hashedPassword = await bcrypt_1.default.hash(userData.password, 10);
            const result = await this.pool.query('INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING *', [userData.username, userData.email, hashedPassword]);
            return result.rows[0] || null;
        }
        catch (err) {
            if (err.code === '23505') {
                throw new Error("DUPE_EMAIL");
            }
            throw new Error("SERVER_ERROR");
        }
    }
    /**
     * Updates user with given fields
     * @param id and number relating to desired user
     * @param userData, fields to be updated
     * @returns the updated user, null if not found
     */
    async updateUser(id, userData) {
        const filteredData = Object.fromEntries(Object.entries(userData)
            .filter(([key, value]) => value !== undefined && value !== null && value !== '' && key !== 'id' && key !== 'created_at'));
        if (filteredData.password) {
            filteredData.password = await bcrypt_1.default.hash(filteredData.password, 10);
        }
        const fields = Object.keys(filteredData).map((key, index) => `${key} = $${index + 2}`).join(", ");
        const values = [id, ...Object.values(filteredData)];
        const result = await this.pool.query(`UPDATE users SET ${fields} WHERE id = $1 RETURNING *`, values);
        return result.rows[0] || null;
    }
    /**
     * Deletes given user
     * @param id, number relating to user to be deleted
     * @returns a boolean, true if deleted, false if user not found
     */
    async deleteUser(id) {
        const result = await this.pool.query('DELETE FROM users WHERE id = $1', [id]);
        return result.rowCount > 0;
    }
    /**
     * Authenticatates user if correct pass and username
     * @param userData, fields to be authenticated
     * @returns an AuthResult(boolean, message?, user?) to see if the authetication
     * passed or not, passes the user if successful
     */
    async authenticateUser(userData) {
        if (!userData.username || !userData.password) {
            throw new Error("INVALID_FIELDS");
        }
        const user = await this.getUserByUsername(userData.username);
        if (!user) {
            throw new Error("INVALID_FIELDS");
        }
        try {
            if (await bcrypt_1.default.compare(userData.password, user.password)) {
                return user;
            }
            throw new Error("INCORRECT_PASSWORD");
        }
        catch (err) {
            console.error("Authentication error: ", err.message);
            throw new Error("SERVER_ERROR");
        }
    }
}
exports.UserModel = UserModel;
//# sourceMappingURL=user.model.js.map
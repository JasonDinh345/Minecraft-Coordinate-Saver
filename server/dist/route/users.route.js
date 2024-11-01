"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const db_1 = __importDefault(require("../db"));
const usersRouter = (0, express_1.Router)();
/**
 * Request to get all User Data
 */
usersRouter.get('/', async (req, res) => {
    try {
        const result = await db_1.default.query("SELECT * FROM users");
        res.json(result.rows);
    }
    catch (err) {
        console.error("Error has occured when getting all users", err.message);
    }
});
usersRouter.get("/:id", async (req, res) => {
    try {
        const result = await db_1.default.query;
    }
    catch (err) {
        console.error("Error has occured while fetching user", err.message);
    }
});
async function findUser(req, res, next) {
    let user;
    try {
        const id = parseInt(req.params.id, 10);
        user = await db_1.default.query(`SELECT * FROM users WHERE id = $1`, [id]);
        if (user == null) {
            return res.status(404).json({ message: "Couldn't Find User with id: ", id });
        }
    }
    catch (err) {
        return res.status(500).json({ message: err.messege });
    }
}
exports.default = usersRouter;
//# sourceMappingURL=users.route.js.map
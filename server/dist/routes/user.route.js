"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const db_1 = __importDefault(require("../utils/db"));
const user_model_1 = require("../models/user.model");
const user_controller_1 = require("../controllers/user.controller");
const userRouter = (0, express_1.Router)();
const userModel = new user_model_1.UserModel(db_1.default);
const userController = new user_controller_1.UserController(userModel);
/**
 * GET request to get all users
 */
userRouter.get('/', userController.getAllUsers.bind(userController));
/**
 * GET request to get a user
 */
userRouter.get("/:id", userController.getUserByID.bind(userController));
/**
 * GET request to authenticate a user based on given username and password
 */
userRouter.get("/login", userController.authenticateUser.bind(userController));
/**
 * POST request to create a new user
 */
userRouter.post("/", userController.createNewUserreq.bind(userController));
/**
 * PATCH request to update a user
 */
userRouter.patch("/:id", userController.updateUser.bind(userController));
/**
 * DELETE request to delete a user
 */
userRouter.delete("/:id", userController.deleteUser.bind(userController));
exports.default = userRouter;
//# sourceMappingURL=user.route.js.map
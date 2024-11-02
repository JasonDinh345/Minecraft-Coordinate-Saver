import {Router} from 'express';
import pool from '../utils/db'
import {UserModel} from "../models/user.model"
import { UserController } from '../controllers/user.controller';

const userRouter : Router = Router();

const userModel :UserModel = new UserModel(pool)
const userController : UserController = new UserController(userModel)
/**
 * GET request to get all users
 */
userRouter.get('/', userController.getAllUsers.bind(userController))
/**
 * GET request to get a user
 */
userRouter.get("/:id", userController.getUserByID.bind(userController))
/**
 * GET request to authenticate a user based on given username and password
 */
userRouter.get("/login", userController.authenticateUser.bind(userController))
/**
 * POST request to create a new user
 */
userRouter.post("/", userController.createNewUserreq.bind(userController))
/**
 * PATCH request to update a user 
 */
userRouter.patch("/:id" ,userController.updateUser.bind(userController))
/**
 * DELETE request to delete a user 
 */
userRouter.delete("/:id", userController.deleteUser.bind(userController))

export default userRouter;
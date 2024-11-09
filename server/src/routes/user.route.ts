import {Router} from 'express';
import pool from '@/utils/db'
import {UserModel} from "@/models/user.model"
import { UserController } from '@/controllers/user.controller';

const userRouter : Router = Router();

const userModel :UserModel = new UserModel(pool)
const userController : UserController = new UserController(userModel)

/**
 * GET request to get a user using JWT to validate the accessToken
 */

userRouter.get("/", userController.authenticateToken.bind(userController), userController.getUser.bind(userController))

/**
* GET request to get a user using JWT to validate the accessToken
*/
userRouter.get("/world/:id", userController.getAllWorldsMatchingUser.bind(userController))

/**
 * POST request to create a new user
 */
userRouter.post("/", userController.createNewUser.bind(userController))
/**
 * PATCH request to update a user 
 */
userRouter.patch("/" ,userController.authenticateToken.bind(userController), userController.updateUser.bind(userController))
/**
 * DELETE request to delete a user 
 */
userRouter.delete("/", userController.authenticateToken.bind(userController), userController.deleteUser.bind(userController))

export default userRouter;
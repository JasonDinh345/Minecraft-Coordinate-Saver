import {Router} from 'express';
import pool from '@/utils/db'
import { WorldModel } from '@/models/world.model';
import { WorldController } from '@/controllers/world.controller';

const worldModel: WorldModel = new WorldModel(pool)
const worldController: WorldController = new WorldController(worldModel);

const worldRouter : Router = Router();
/**
 * GET request to retrieve a world's data 
 */
worldRouter.get("/:id" ,worldController.getWorld.bind(worldController))
/**
 * GET request to retrieve all users in a world
 */
worldRouter.get("/users/:id",worldController.getAllUsersInAWorld.bind(worldController))
/**
 * GET request to retrieve all coords in a world
 */
worldRouter.get("/coords/:id",worldController.getAllCoordsInAWorld.bind(worldController))
/**
 * POST request to create a new world
 */
worldRouter.post("/", worldController.createNewWorld.bind(worldController))
/**
 * POST request to add user to world
 */
worldRouter.post("/user/:id", worldController.addUserToWorld.bind(worldController))
/**
 * POST request to add coords to world
 */
worldRouter.post("/coords/:id",worldController.addNewCoordToWorld.bind(worldController))
/**
 * PATCH request to update world data
 */
worldRouter.patch("/:id",worldController.updateWorldData.bind(worldController))
/**
 * PATCH request to update user role on given world
 */
worldRouter.patch("/user/:id",worldController.updateUserRole.bind(worldController))
/**
 * PATCH request to update coords on given world
 */
worldRouter.patch("/coords/:id/:name", worldController.updateCoords.bind(worldController))
/**
 * DELETE request to delete a world, along with its relations 
 */
worldRouter.delete("/:id",worldController.deleteWorld.bind(worldController))
/**
 * DELETE request to removes a user from world
 */
worldRouter.delete("/user/:id",worldController.removeUserFromWorld.bind(worldController))
/**
 * DELETE request to removes coords from world
 */
worldRouter.delete("/coords/:id/:name",worldController.deleteCoords.bind(worldController))
export default worldRouter;
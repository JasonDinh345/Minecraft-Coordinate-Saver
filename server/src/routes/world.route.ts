import {Router} from 'express';
import pool from '@/utils/db'
import { WorldModel } from '@/models/world.model';
import { WorldController } from '@/controllers/world.controller';

const worldModel: WorldModel = new WorldModel(pool)
const worldController: WorldController = new WorldController(worldModel);

const worldRouter : Router = Router();
/**
 * Get a world's data
 */
worldRouter.get("/:id" ,worldController.getWorld.bind(worldController))
/**
 * Get all users in a world
 */
worldRouter.get("/users/:id",worldController.getAllUsersInAWorld.bind(worldController))
/**
 * Get all coords in a world
 */
worldRouter.get("/coords/:id",worldController.getAllCoordsInAWorld.bind(worldController))
/**
 * Create new world
 */
worldRouter.post("/", worldController.createNewWorld.bind(worldController))
/**
 * Add user to world
 */
worldRouter.post("/user/:id", worldController.addUserToWorld.bind(worldController))
/**
 * Add coords to world
 */
worldRouter.post("/coords/:id",worldController.addNewCoordToWorld.bind(worldController))
/**
 * Update world data
 */
worldRouter.patch("/:id",worldController.updateWorldData.bind(worldController))
/**
 * Update user role on given world
 */
worldRouter.patch("/user/:id",worldController.updateUserRole.bind(worldController))
/**
 * Update coords on given world
 */
worldRouter.patch("/coords/:id", worldController.updateCoords.bind(worldController))
/**
 * Deletes world
 */
worldRouter.delete("/:id",worldController.deleteWorld.bind(worldController))
/**
 * Removes user from world
 */
worldRouter.delete("/user/:id",worldController.removeUserFromWorld.bind(worldController))
/**
 * Removes coords from world
 */
worldRouter.delete("/coords/:id",worldController.deleteCoords.bind(worldController))
export default worldRouter;
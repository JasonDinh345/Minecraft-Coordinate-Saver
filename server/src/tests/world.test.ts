import { describe } from 'node:test'
import request from 'supertest'
import {app} from '@/server'; 
import pool from "@/utils/db"
import dotenv from 'dotenv'
import { Server } from 'node:http';

let server: Server
/**
 * Tester for auth and user routes
 */
dotenv.config()
/**
 * Sets test on port 6000
 */
beforeAll(()=>{
    server = app.listen(6000)
})
/**
 * Prevents changes to db
 */
beforeEach(async () => {
    
    await pool.query('BEGIN;');
    
});
/**
 * Prevents changes to db
 */ 
afterEach(async () => {
    
    await pool.query('ROLLBACK;');
   
});
/**
 * Resets the seqeunce and closes the pool and server
 */
afterAll( async() => {
    const worldDBLength = (await pool.query("SELECT * FROM worlds")).rowCount
    await pool.query(`ALTER SEQUENCE ${process.env.WORLD_SEQUENCE} RESTART WITH ${worldDBLength + 1};`)
    await pool.end(); 
    await server.close(); 
});
/**
 * GET REQUEST TESTS
 */
describe("GET REQUEST", ()=>{
    /**
     * Testing getting a world's data
     * /world/:id
     */
    describe("Get world data", ()=>{
        /**
         * Testing with valid id
         */
        describe("Given valid world id", ()=>{
            it("should return 200", async()=>{
                const response = await request(app).get(`/world/${process.env.TEST_WORLD_ID}`)
                expect(response.status).toBe(200)
            })
        })
        /**
         * Testing with invalid id
         */
        describe("Given invalid world id", ()=>{
            it("should return 404", async()=>{
                const response = await request(app).get(`/world/-1`)
                expect(response.status).toBe(404)
            })
        })
    })
    /**
     * Testing getting all users in a world 
     * /world/users/:id
     */
    describe("Get all users in a world", ()=>{
        /**
         * Testing with a valid id
         */
        describe("Given valid world id", ()=>{
            it("should return 200", async()=>{
                const response = await request(app).get(`/world/users/${process.env.TEST_WORLD_ID}`)
                expect(response.status).toBe(200)
            })
        })
        /**
         * Testing with a invalid id
         */
        describe("Given invalid world id", ()=>{
            it("should return 404", async()=>{
                const response = await request(app).get(`/world/users/-1`)
                expect(response.status).toBe(404)
            })
        })
    })
    /**
     * Testing getting all coords in a world
     * /world/coords/:id
     */
    describe("Get all coords in a world", ()=>{
        /**
         * Testing with valid world id
         */
        describe("Given valid world id", ()=>{
            it("should return 200", async()=>{
                const response = await request(app).get(`/world/coords/${process.env.TEST_WORLD_ID}`)
                expect(response.status).toBe(200)
            })
        })
        /**
         * Testing with invalid world id
         */
        describe("Given invalid world id", ()=>{
            it("should return 404", async()=>{
                const response = await request(app).get(`/world/coords/-1`)
                expect(response.status).toBe(404)
            })
        })
       
    })
})
/**
 * Testing POST REQUESTS    
 */
describe("POST REQUESTS", ()=>{
    /**
     * Testing world creation
     * /world
     */
    describe("Create new world", ()=>{
        /**
         * Testing with valid world data
         */
        describe("Given valid world data", ()=>{
            it("Should return 201", async()=>{
                const response = await request(app).post(`/world/`)
                .send({name: "Super Fun World"})
                expect(response.status).toBe(201)
            })
        })
        /**
         * Testing with invalid data
         */
        describe("Given invalid world data", ()=>{
            it("Should return 400", async()=>{
                const response = await request(app).post(`/world/`)
                .send({name: ""})
                expect(response.status).toBe(400)
            })
        })
    })
    /**
     * Testing adding user to a world 
     * /world/user/:id
     */
    describe("Add new user to world", ()=>{
        /**
         * Testing with valid fields
         */
        describe("Given valid email and role name", ()=>{
            it("Shoudl return 201", async()=>{
                const response = await request(app).post(`/world/user/${process.env.TEST_WORLD_ID}`)
                .send({user_email: process.env.TEST_USER_EMAIL, role_name: process.env.TEST_ROLE})
                expect(response.status).toBe(201)
            })
        })
        /**
         * Testing with an already added user
         */
        describe("Given a already added user",()=>{
            it("Shoudl return 403", async()=>{
                await request(app).post(`/world/user/${process.env.TEST_WORLD_ID}`)
                .send({user_email: process.env.TEST_USER_EMAIL, role_name: process.env.TEST_ROLE})

                const response = await request(app).post(`/world/user/${process.env.TEST_WORLD_ID}`)
                .send({user_email: process.env.TEST_USER_EMAIL, role_name: process.env.TEST_ROLE})
                expect(response.status).toBe(403)
            })
        })
        /**
         * Testing with nonexistant user
         */
        describe("Given a invalid user",()=>{
            it("Shoudl return 404", async()=>{
                const response = await request(app).post(`/world/user/${process.env.TEST_WORLD_ID}`)
                .send({user_email: "fake@email.com", role_name: process.env.TEST_ROLE})
                expect(response.status).toBe(404)
            })
        })
        /**
         * Testing with nonexistant role
         */
        describe("Given a invalid role",()=>{
            it("Shoudl return 404", async()=>{
                const response = await request(app).post(`/world/user/${process.env.TEST_WORLD_ID}`)
                .send({user_email: process.env.TEST_USER_EMAIL, role_name: "SUPREME_LEADER"})
                expect(response.status).toBe(404)
            })
        })
        /**
         * Testing with invalid fields
         */
        describe("Given a invalid fields",()=>{
            it("Should return 400", async()=>{
                const response = await request(app).post(`/world/user/${process.env.TEST_WORLD_ID}`)
                .send({user_email: "", role_name: null})
                expect(response.status).toBe(400)
            })
        })
    })
    /**
     * Testing adding a new coord to a world 
     * /world/coords/:id
     */
    describe("Add new coords to a world", ()=>{
        /**
         * Testing with valid fields
         */
        describe("Given valid coords data", ()=>{
            it("Should return 201", async()=>{
                const response = await request(app).post(`/world/coords/${process.env.TEST_WORLD_ID}`)
                .send({name: "Test World", x_coord : 0, y_coord: 0, z_coord: 0})
                expect(response.status).toBe(201)
            })
        })
        /**
         * Testing with no z coord, which can be null
         */
        describe("Given valid coords data with no z coord", ()=>{
            it("Should return 201", async()=>{
                const response = await request(app).post(`/world/coords/${process.env.TEST_WORLD_ID}`)
                .send({name: "Test World", x_coord : 0, y_coord: 0})
                expect(response.status).toBe(201)
            })
        })
        /**
         * Testing with invalid world id
         */
        describe("Given invalid world id", ()=>{
            it("Should return 404", async()=>{
                const response = await request(app).post(`/world/coords/-1`)
                .send({name: "Test World", x_coord : 0, y_coord: 0})
                expect(response.status).toBe(404)
            })
        })
        /**
         * Testing with no name entered
         */
        describe("Given invalid name", ()=>{
            it("Should return 400", async()=>{
                const response = await request(app).post(`/world/coords/${process.env.TEST_WORLD_ID}`)
                .send({name: "", x_coord : 0, y_coord: 0})
                expect(response.status).toBe(400)
            })
        })
        /**
         * Testing with invalid fields
         */
        describe("Given invalid coords", ()=>{
            it("Should return 400", async()=>{
                const response = await request(app).post(`/world/coords/${process.env.TEST_WORLD_ID}`)
                .send({name: "",  y_coord: null})
                expect(response.status).toBe(400)
            })
        })
        /**
         * Testing with already existing coord name in world
         */
        describe("Given dupe name in same world", ()=>{
            it("Should return 403", async()=>{
                const response = await request(app).post(`/world/coords/${process.env.TEST_WORLD_ID}`)
                .send({name: process.env.TEST_COORD_NAME, x_coord : 0, y_coord: 0})
                expect(response.status).toBe(403)
            })
        })
    })
})
/**
 * Testing PATCH REQUESTS
 */
describe("PATCH REQUESTS", ()=>{
    /**
     * Testing updating world data
     * /world/:id
     */
    describe("Updating world data", ()=>{
        /**
         * Testing with valid fields
         */
        describe("Given valid data", ()=>{
            it("should return 200", async()=>{
                const response = await request(app).patch(`/world/${process.env.TEST_WORLD_ID}`)
                .send({name: "Updated World Name",  seed: "Updated Seed"})
                expect(response.status).toBe(200)
            })
        })
        /**
         * Testing with invalid world id
         */
        describe("Given invalid world id", ()=>{
            it("should return 404", async()=>{
                const response = await request(app).patch(`/world/-1`)
                .send({name: "Updated World Name",  seed: "Updated Seed"})
                expect(response.status).toBe(404)
            })
        })
    })
    /**
     * Testing updating user roles
     * /world/user/:id
     */
    describe("Updating user roles", ()=>{
       /**
        * Testing with valid role
        */
        describe("Given valid role", ()=>{
            it("Should return 200", async()=>{
                const response = await request(app).patch(`/world/user/${process.env.TEST_WORLD_ID}`)
                .send({role_name: process.env.TEST_ROLE, user_email: process.env.TAKEN_EMAIL })
                expect(response.status).toBe(200)
                
            })
        })
        /**
        * Testing with invalid role
        */
        describe("Given invalid role", ()=>{
            it("Should return 404", async()=>{
                const response = await request(app).patch(`/world/user/${process.env.TEST_WORLD_ID}`)
                .send({role_name: "President of the US", user_email: process.env.TAKEN_EMAIL })
                expect(response.status).toBe(404)
                
            })
        })
        /**
         * Testing with invalid email/user
         */
        describe("Given invalid email", ()=>{
            it("Should return 404", async()=>{
                const response = await request(app).patch(`/world/user/${process.env.TEST_WORLD_ID}`)
                .send({role_name: process.env.TEST_ROLE, user_email: "bestgamer@real.com" })
                expect(response.status).toBe(404)
                
            })
        })
        /**
         * Testing with invalid fields
         */
        describe("Given invalid fields", ()=>{
            it("Should return 400", async()=>{
                const response = await request(app).patch(`/world/user/${process.env.TEST_WORLD_ID}`)
                .send({ user_email: "" })
                expect(response.status).toBe(400)
                
            })
        })
    })
    /**
     * Testing updating coords
     * /world/coords/:id/:name
     */
    describe("Update coords in a world", ()=>{
        /**
         * Testing with valid fields
         */
        describe("Given valid coord data and world id", ()=>{
            it("Should return 200", async()=>{
                const response = await request(app).patch(`/world/coords/${process.env.TEST_WORLD_ID}/${process.env.TEST_COORD_NAME}`)
                .send({name: "Test World", x_coord : 0, y_coord: 0, z_coord: 40, description:"House Base"})
                expect(response.status).toBe(200)
            })
        })
        /**
         * Testing updating coord name to an already existing one
         */
        describe("Given dupe coord name", ()=>{
            it("Should return 403", async()=>{
                const response = await request(app).patch(`/world/coords/${process.env.TEST_WORLD_ID}/${process.env.TEST_COORD_NAME}`)
                .send({name: process.env.TEST_COORD_NAME, x_coord : 0, y_coord: 0, z_coord: 40, description:"House Base"})
                expect(response.status).toBe(403)
            })
        })
        /**
         * Testing with non existant coord name in the given world
         */
        describe("Given invalid coord name", ()=>{
            it("Should return 404", async()=>{
                const response = await request(app).patch(`/world/coords/${process.env.TEST_WORLD_ID}/helloWorld234`)
                .send({name: "Test World", x_coord : 0, y_coord: 0, z_coord: 40, description:"House Base"})
                expect(response.status).toBe(404)
            })
        })
        /**
         * Testing with invalid world id
         */
        describe("Given invalid world id", ()=>{
            it("Should return 404", async()=>{
                const response = await request(app).patch(`/world/coords/-1/${process.env.TEST_COORD_NAME}`)
                .send({name: "Test World", x_coord : 0, y_coord: 0, z_coord: 40, description:"House Base"})
                expect(response.status).toBe(404)
            })
        })
    })
})
/**
 * Testing DELETE REQUESTS
 */
describe("DELETE REQUESTS", ()=>{
    /**
     * Testing deleting a world 
     * /world/:id
     */
    describe("Delete World", ()=>{
        /**
         * Testing with valid world id
         * Also checks that it removes its relations 
         */
        describe("Given valid world id", ()=>{
            it(`Should return 204 and delete related realtions between users and coords`, async()=>{
                const response = await request(app).delete(`/world/${process.env.TEST_WORLD_ID}`)
                expect(response.status).toBe(204)
                const checkUsers = await request(app).get(`/world/users/${process.env.TEST_WORLD_ID}`)
                expect(checkUsers.status).toBe(404)
                const checkCoords = await request(app).get(`/world/coords/${process.env.TEST_WORLD_ID}`)
                expect(checkCoords.status).toBe(404)
            })
        })
        /**
         * Testing with invalid world id
         */
        describe("Given invalid world id", ()=>{
            it(`Should return 404`, async()=>{
                const response = await request(app).delete(`/world/-1`)
                expect(response.status).toBe(404)
                
            })
        })
    })
    /**
     * Testing removing a user from a world 
     * /world/user/:id
     */
    describe("Remove User from World", ()=>{
        /**
         * Testing with an existing user in the world 
         */
        describe("Given valid user", ()=>{
            it(`Should return 204 `, async()=>{
                await request(app).post(`/world/user/${process.env.TEST_WORLD_ID}`)
                .send({user_email: process.env.TEST_USER_EMAIL, role_name: process.env.TEST_ROLE})

                const response = await request(app).delete(`/world/user/${process.env.TEST_WORLD_ID}`)
                .send({user_email: process.env.TEST_USER_EMAIL, role_name: process.env.TEST_ROLE})
                expect(response.status).toBe(204)
                
            })
        })
        /**
         * Testing with an invalid world id
         */
        describe("Given invalid world id", ()=>{
            it(`Should return 404`, async()=>{
                const response = await request(app).delete(`/world/user/-1`)
                .send({user_email: process.env.TEST_USER_EMAIL, role_name: process.env.TEST_ROLE})
                expect(response.status).toBe(404)
                
            })
        })
        /**
         * Testiing with user not in world 
         */
        describe("Given invalid user email", ()=>{
            it(`Should return 404`, async()=>{
                const response = await request(app).delete(`/world/user/${process.env.TEST_WORLD_ID}`)
                .send({user_email: "notarealuser@404.com", role_name: process.env.TEST_ROLE})
                expect(response.status).toBe(404)
                
            })
        })
        /**
         * Testing trying to remove an admin
         */
        describe("Given admin user", ()=>{
            it(`Should return 403`, async()=>{
                const response = await request(app).delete(`/world/user/${process.env.TEST_WORLD_ID}`)
                .send({user_email: process.env.TAKEN_EMAIL, role_name: process.env.ADMIN_ROLE})
                expect(response.status).toBe(403)
                
            })
        })
    })
    /**
     * Testing removing coords from a world 
     * /world/coords/:id/:name
     */
    describe("Delete Coords",()=>{
        /**
         * Testing deleting a valid coord
         */
        describe("Given valid coord name",()=>{
            it("Should return 200", async()=>{
                const response = await request(app).delete(`/world/coords/${process.env.TEST_WORLD_ID}/${process.env.TEST_COORD_NAME}`)
                expect(response.status).toBe(204)

            })
        })
        /**
         * Testing deleting a non existent coord
         */
        describe("Given invalid coord name",()=>{
            it("Should return 404", async()=>{
                const response = await request(app).delete(`/world/coords/${process.env.TEST_WORLD_ID}/notreal`)
                expect(response.status).toBe(404)

            })
        })
        /**
         * Testing with invalid world id
         */
        describe("Given invalid world id",()=>{
            it("Should return 404", async()=>{
                const response = await request(app).delete(`/world/coords/-1/${process.env.TEST_COORD_NAME}`)
                .send({coord_name: process.env.TEST_COORD_NAME})
                expect(response.status).toBe(404)

            })
        })
    })
})
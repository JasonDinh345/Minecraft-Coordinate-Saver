import { describe } from 'node:test'
import request from 'supertest'
import {app} from '@/server'; 
import pool from "@/utils/db"
import {User} from "@/types/user/user.type"
import dotenv from 'dotenv'
import { Server } from 'node:http';
import { response } from 'express';
let server: Server
/**
 * Tester for auth and user routes
 */
dotenv.config()
/**
 * Prevents changes to db
 */
beforeAll(()=>{
    server = app.listen(6000)
})
beforeEach(async () => {
    
    await pool.query('BEGIN;');
    
});
/**
 * Prevents changes to db
 */ 
afterEach(async () => {
    
    await pool.query('ROLLBACK;');
   
});
afterAll( async() => {
    const worldDBLength = (await pool.query("SELECT * FROM worlds")).rowCount
    await pool.query(`ALTER SEQUENCE ${process.env.WORLD_SEQUENCE} RESTART WITH ${worldDBLength + 1};`)
    await pool.end(); 
    await server.close(); 
});
describe("GET REQUEST", ()=>{
    describe("Get world data", ()=>{
        describe("Given valid world id", ()=>{
            it("should return 200", async()=>{
                const response = await request(app).get(`/world/${process.env.TEST_WORLD_ID}`)
                expect(response.status).toBe(200)
            })
        })
        describe("Given invalid world id", ()=>{
            it("should return 404", async()=>{
                const response = await request(app).get(`/world/-1`)
                expect(response.status).toBe(404)
            })
        })
    })
    describe("Get all users in a world", ()=>{
        describe("Given valid world id", ()=>{
            it("should return 200", async()=>{
                const response = await request(app).get(`/world/users/${process.env.TEST_WORLD_ID}`)
                expect(response.status).toBe(200)
            })
        })
        describe("Given invalid world id", ()=>{
            it("should return 404", async()=>{
                const response = await request(app).get(`/world/users/-1`)
                expect(response.status).toBe(404)
            })
        })
    })
    describe("Get all coords in a world", ()=>{
        describe("Given valid world id", ()=>{
            it("should return 200", async()=>{
                const response = await request(app).get(`/world/coords/${process.env.TEST_WORLD_ID}`)
                expect(response.status).toBe(200)
            })
        })
       
    })
})
describe("POST REQUESTS", ()=>{
    describe("Create new world", ()=>{

        describe("Given valid world data", ()=>{
            it("Should return 201", async()=>{
                const response = await request(app).post(`/world/`)
                .send({name: "Super Fun World"})
                expect(response.status).toBe(201)
            })
        })
        
        describe("Given invalid world data", ()=>{
            it("Should return 400", async()=>{
                const response = await request(app).post(`/world/`)
                .send({name: ""})
                expect(response.status).toBe(400)
            })
        })
    })
    describe("Add new user to world", ()=>{
        describe("Given valid email and role name", ()=>{
            it("Shoudl return 201", async()=>{
                const response = await request(app).post(`/world/user/${process.env.TEST_WORLD_ID}`)
                .send({user_email: process.env.TEST_USER_EMAIL, role_name: process.env.TEST_ROLE})
                expect(response.status).toBe(201)
            })
        })
        describe("Given a already added user",()=>{
            it("Shoudl return 403", async()=>{
                await request(app).post(`/world/user/${process.env.TEST_WORLD_ID}`)
                .send({user_email: process.env.TEST_USER_EMAIL, role_name: process.env.TEST_ROLE})

                const response = await request(app).post(`/world/user/${process.env.TEST_WORLD_ID}`)
                .send({user_email: process.env.TEST_USER_EMAIL, role_name: process.env.TEST_ROLE})
                expect(response.status).toBe(403)
            })
        })
        describe("Given a invalid user",()=>{
            it("Shoudl return 404", async()=>{
                const response = await request(app).post(`/world/user/${process.env.TEST_WORLD_ID}`)
                .send({user_email: "fake@email.com", role_name: process.env.TEST_ROLE})
                expect(response.status).toBe(404)
            })
        })
        describe("Given a invalid role",()=>{
            it("Shoudl return 404", async()=>{
                const response = await request(app).post(`/world/user/${process.env.TEST_WORLD_ID}`)
                .send({user_email: process.env.TEST_USER_EMAIL, role_name: "SUPREME_LEADER"})
                expect(response.status).toBe(404)
            })
        })
        describe("Given a invalid fields",()=>{
            it("Should return 400", async()=>{
                const response = await request(app).post(`/world/user/${process.env.TEST_WORLD_ID}`)
                .send({user_email: "", role_name: null})
                expect(response.status).toBe(400)
            })
        })
    })
    describe("Add new coords to a world", ()=>{
        describe("Given valid coords data", ()=>{
            it("Should return 201", async()=>{
                const response = await request(app).post(`/world/coords/${process.env.TEST_WORLD_ID}`)
                .send({name: "Test World", x_coord : 0, y_coord: 0, z_coord: 0})
                expect(response.status).toBe(201)
            })
        })
        describe("Given valid coords data with no z coord", ()=>{
            it("Should return 201", async()=>{
                const response = await request(app).post(`/world/coords/${process.env.TEST_WORLD_ID}`)
                .send({name: "Test World", x_coord : 0, y_coord: 0})
                expect(response.status).toBe(201)
            })
        })
        describe("Given invalid world id", ()=>{
            it("Should return 404", async()=>{
                const response = await request(app).post(`/world/coords/-1`)
                .send({name: "Test World", x_coord : 0, y_coord: 0})
                expect(response.status).toBe(404)
            })
        })
        describe("Given invalid name", ()=>{
            it("Should return 400", async()=>{
                const response = await request(app).post(`/world/coords/${process.env.TEST_WORLD_ID}`)
                .send({name: "", x_coord : 0, y_coord: 0})
                expect(response.status).toBe(400)
            })
        })
        describe("Given invalid coords", ()=>{
            it("Should return 400", async()=>{
                const response = await request(app).post(`/world/coords/${process.env.TEST_WORLD_ID}`)
                .send({name: "",  y_coord: null})
                expect(response.status).toBe(400)
            })
        })
        describe("Given dupe name in same world", ()=>{
            it("Should return 403", async()=>{
                const response = await request(app).post(`/world/coords/${process.env.TEST_WORLD_ID}`)
                .send({name: process.env.TEST_COORD_NAME, x_coord : 0, y_coord: 0})
                expect(response.status).toBe(403)
            })
        })
    })
})
describe("PATCH REQUESTS", ()=>{
    describe("Updating world data", ()=>{
        describe("Given valid data", ()=>{
            it("should return 200", async()=>{
                const response = await request(app).patch(`/world/${process.env.TEST_WORLD_ID}`)
                .send({name: "Updated World Name",  seed: "Updated Seed"})
                expect(response.status).toBe(200)
            })
        })
        describe("Given invalid world id", ()=>{
            it("should return 404", async()=>{
                const response = await request(app).patch(`/world/-1`)
                .send({name: "Updated World Name",  seed: "Updated Seed"})
                expect(response.status).toBe(404)
            })
        })
        describe("Given invalid world id", ()=>{
            it("should return 404", async()=>{
                const response = await request(app).patch(`/world/-1`)
                .send({name: "Updated World Name",  seed: "Updated Seed"})
                expect(response.status).toBe(404)
            })
        })
    })
    describe("Updating user roles", ()=>{
       
        describe("Given valid role", ()=>{
            it("Should return 200", async()=>{
                const response = await request(app).patch(`/world/user/${process.env.TEST_WORLD_ID}`)
                .send({role_name: process.env.TEST_ROLE, user_email: process.env.TAKEN_EMAIL })
                expect(response.status).toBe(200)
                
            })
        })
        describe("Given invalid role", ()=>{
            it("Should return 404", async()=>{
                const response = await request(app).patch(`/world/user/${process.env.TEST_WORLD_ID}`)
                .send({role_name: "President of the US", user_email: process.env.TAKEN_EMAIL })
                expect(response.status).toBe(404)
                
            })
        })
        describe("Given invalid email", ()=>{
            it("Should return 404", async()=>{
                const response = await request(app).patch(`/world/user/${process.env.TEST_WORLD_ID}`)
                .send({role_name: process.env.TEST_ROLE, user_email: "bestgamer@real.com" })
                expect(response.status).toBe(404)
                
            })
        })
        describe("Given invalid fields", ()=>{
            it("Should return 400", async()=>{
                const response = await request(app).patch(`/world/user/${process.env.TEST_WORLD_ID}`)
                .send({ user_email: "" })
                expect(response.status).toBe(400)
                
            })
        })
    })
    describe("Update coords in a world", ()=>{
        describe("Given valid coord data", ()=>{
            it("Should return 200", async()=>{
                const response = await request(app).patch(`/world/coords/${process.env.TEST_COORD_NAME}`)
                .send({name: "Test World", x_coord : 0, y_coord: 0, z_coord: 40, description:"House Base"})
                expect(response.status).toBe(200)
            })
        })
        describe("Given dupe coord name", ()=>{
            it("Should return 403", async()=>{
                const response = await request(app).patch(`/world/coords/${process.env.TEST_COORD_NAME}`)
                .send({name: process.env.TEST_COORD_NAME, x_coord : 0, y_coord: 0, z_coord: 40, description:"House Base"})
                expect(response.status).toBe(403)
            })
        })
        describe("Given invalid coord name", ()=>{
            it("Should return 403", async()=>{
                const response = await request(app).patch(`/world/coords/helloWorld234`)
                .send({name: "Test World", x_coord : 0, y_coord: 0, z_coord: 40, description:"House Base"})
                expect(response.status).toBe(404)
            })
        })
    })
})
describe("DELETE REQUESTS", ()=>{
    describe("Delete World", ()=>{
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
        describe("Given invalid world id", ()=>{
            it(`Should return 404`, async()=>{
                const response = await request(app).delete(`/world/-1`)
                expect(response.status).toBe(404)
                
            })
        })
    })
    describe("Remove User from World", ()=>{
        describe("Given valid user", ()=>{
            it(`Should return 204 `, async()=>{
                await request(app).post(`/world/user/${process.env.TEST_WORLD_ID}`)
                .send({user_email: process.env.TEST_USER_EMAIL, role_name: process.env.TEST_ROLE})

                const response = await request(app).delete(`/world/user/${process.env.TEST_WORLD_ID}`)
                .send({user_email: process.env.TEST_USER_EMAIL, role_name: process.env.TEST_ROLE})
                expect(response.status).toBe(204)
                
            })
        })
        describe("Given invalid world id", ()=>{
            it(`Should return 404`, async()=>{
                const response = await request(app).delete(`/world/user/-1`)
                .send({user_email: process.env.TEST_USER_EMAIL, role_name: process.env.TEST_ROLE})
                expect(response.status).toBe(404)
                
            })
        })
        describe("Given invalid user email", ()=>{
            it(`Should return 404`, async()=>{
                const response = await request(app).delete(`/world/user/${process.env.TEST_WORLD_ID}`)
                .send({user_email: "notarealuser@404.com", role_name: process.env.TEST_ROLE})
                expect(response.status).toBe(404)
                
            })
        })
        describe("Given admin user", ()=>{
            it(`Should return 403`, async()=>{
                const response = await request(app).delete(`/world/user/${process.env.TEST_WORLD_ID}`)
                .send({user_email: process.env.TAKEN_EMAIL, role_name: process.env.ADMIN_ROLE})
                expect(response.status).toBe(403)
                
            })
        })
    })
})
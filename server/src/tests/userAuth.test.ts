import { describe } from 'node:test'
import request from 'supertest'
import {app, server} from '@/server'; 
import pool from "@/utils/db"
import {User} from "@/types/user/user.type"
import dotenv from 'dotenv'
import { authApp, authServer } from '@/authServer';
/**
 * Tester for auth and user routes
 */
dotenv.config()
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
 * Resets the user id sequence and closes the server
 */
afterAll(async () => {
    const response = await request(app).get('/user'); 
    await pool.query(`ALTER SEQUENCE ${process.env.USER_SEQUENCE} RESTART WITH ${response.body.length + 1};`)
    await pool.end(); 
    
    await server.close(); 
    await authServer.close()
});
/**
 * Tests for auth routes
 */
describe("AUTH ROUTES", ()=>{
    /**
     * Tests for Login requests
     */
    describe("Login", ()=>{
        /**
         * Testing login with valid credentials
         */
        describe("Given valid username and password", ()=>{
            it("should return 201", async()=>{
                const response = await request(authApp)
                    .post("/auth/login")
                    .send({username: process.env.TEST_USER_USERNAME, password:process.env.TEST_USER_PASSWORD})
                expect(response.status).toBe(201);
                expect(response.body).toHaveProperty("accessToken")
                expect(response.body).toHaveProperty("refreshToken")
            })
        })
        /**
         * Testing login with invalid password
         */
        describe("Given valid username and wrong password", ()=>{
            it("should return 401", async()=>{
                const response = await request(authApp)
                    .post("/auth/login")
                    .send({username: process.env.TEST_USER_USERNAME, password: "totallyrightpass"})
                expect(response.status).toBe(401);
            })
        /**
         * Testing login with invalid username
         */
        describe("Given invalid username", ()=>{
            it("should return 404", async()=>{
                const response = await request(authApp)
                    .post("/auth/login")
                    .send({username: "notarealusername", password: "totallyrightpass"}) 
                 expect(response.status).toBe(404);   
                })
            })
        /**
         * Testing login with null fields
         */
        describe("Given no username and password", ()=>{
            it("should return 400", async()=>{
                const response = await request(authApp)
                    .post("/auth/login")
                    .send({username: "", password: ""}) 
                 expect(response.status).toBe(400);   
                })
            })
        })
    /**
     * Tests for getting new access tokens with refresh tokens
     */
    describe("Getting new access tokens", ()=>{
        /**
         * Testing with valid refresh token
         */
        describe("Given a valid refresh token", ()=>{
            it("should return 201", async()=>{
                const refreshToken = (await request(authApp).post("/auth/login")
                    .send({username: process.env.TEST_USER_USERNAME, password: process.env.TEST_USER_PASSWORD}))
                    .body.refreshToken
                const response = await request(authApp)
                    .post("/auth/token")
                    .send({token: refreshToken}) 
                expect(response.status).toBe(201)
            })
        })
        /**
         * Testing with expired refresh token
         */
        describe("Given a invalid refresh token", ()=>{
            it("should return 403", async()=>{
                const response = await request(authApp)
                    .post("/auth/token")
                    .send({token: "nonvalidToken"}) 
                expect(response.status).toBe(403)
            })
        })
        /**
         * Testing with null
         */
        describe("Given a no refresh token", ()=>{
            it("should return 401", async()=>{
                const response = await request(authApp)
                    .post("/auth/token")
                    .send({token: ""}) 
                expect(response.status).toBe(401)
            })
        })
    }) 
    /** 
     * Tests for logout requests
     */  
    describe("Logout", ()=>{
        /**
         * Testing with valid refresh token
         */
        describe("Given valid refresh token", ()=>{
            it("should return 204", async()=>{
                const refreshToken = (await request(authApp)
                    .post("/auth/login")
                    .send({username: process.env.TEST_USER_USERNAME, password: process.env.TEST_USER_PASSWORD}))
                    .body.refreshToken
                const response = await request(authApp)
                    .delete("/auth/logout")
                    .send({token: refreshToken}) 
                expect(response.status).toBe(204)
            })
        })
        /**
         * Testing with expired token
         */
        describe("Given invalid refresh token", ()=>{
            it("should return 403", async()=>{
                const response = await request(authApp)
                    .delete("/auth/logout")
                    .send({token: "realrefreshtoken"}) 
                expect(response.status).toBe(404)
            })
        })
        
    })
    })
})
/**
 * Tests for User Routes
 */
describe("User Route", ()=>{
    /** Universal accessToken for tests */
    let accessToken: string
    /**
     * Initializes accessToken for test user
     */
    beforeAll(async()=>{
        await pool.query('BEGIN;');
        const login = await request(authApp)
            .post("/auth/login")
            .send({username: process.env.TEST_USER_USERNAME, password:process.env.TEST_USER_PASSWORD})
        accessToken = login.body.accessToken
    })
    /**
     * Tests for GET requests
     */
     describe("GET request for a user", ()=>{
        /**
         * Testing with valid access token
         */
        describe("Given a valid token", ()=>{
            it("should return 200", async()=>{
                const response = await request(app)
                    .get(`/user`)
                    .set('Authorization', `Bearer ${accessToken}`)  
                 expect(response.status).toBe(200);
            })
        })
        /**
         * Testing with expired token
         */
        describe("Given an invalid access Token", ()=>{
            it("should return 403", async()=>{
                const response = await request(app)
                    .get('/user/')
                    .set('Authorization', `Bearer 23452345`)  ; 
                expect(response.status).toBe(403);
            })
        })     
    })
    /**
     * Tests for POST requests
     */
    describe("POST REQUESTS", ()=>{
        /** Universal user to be created */
        let user : Omit<User, 'id' | 'created_at'>
        /**
         * Testing with valid fields 
         */
        describe("Given valid user data",()=>{
            it("should return 201", async ()=>{
                user = {username: "john45", password: "123", email:"johnissocool345@test.com"}
                const response = await request(app)
                    .post('/user')
                    .send(user); 
                expect(response.status).toBe(201);
                expect(response.body).toEqual(expect.any(Object));
            })
        })
        /**
         * Testing with empty fields
         */
        describe("Given empty user data", ()=>{
            it("should return 400", async ()=>{
                user = {username: " ", password: "", email:""}
                const response = await request(app)
                    .post('/user')
                    .send(user); 
                expect(response.status).toBe(400);
            })    
        })
        /**
         * Testing with duplicate emails
         */
        describe("Given duplicate email", ()=>{
            it("should return 409", async ()=>{
                const user2 : Omit<User, 'id' | 'created_at'> = {username: "john45", password: "123", email:"johnissocool345@test.com"}
                user = {username: "john45", password: "3456", email:"johnissocool345@test.com"}
                await request(app)
                    .post('/user')
                    .send(user2); 
                const response = await request(app)
                    .post('/user')
                    .send(user); 
                expect(response.status).toBe(409);
            }) 
        })
    })
    /**
     * Tests for PATCH requests
     */
    describe("PATCH REQUEST", ()=>{
        /**
         * Testing with valid updated fields
         */
        describe("Given valid userdata", ()=>{
            it("should return 200", async()=>{
                const response = await request(app)
                    .patch(`/user`)
                    .send({ username: "tester", password: "test", email:"email@gmail.com" })
                    .set('Authorization', `Bearer ${accessToken}`); 
                expect(response.status).toBe(200);
          
            })
        })
        /**
         * Testing that trying to change the id wouldn't do anything
         */
        describe("Given valid user data", ()=>{
            it("shouldnt change the id", async()=>{
                const response = await request(app)
                    .patch(`/user`)
                    .send({id:4, username: "tester", password: "test", email:"email@gmail.com"})
                    .set('Authorization', `Bearer ${accessToken}`); 
                expect(response.body.id).toEqual(Number(process.env.TEST_USER_ID));
            })
        })
        /**
         * Testing updating to duplicate email
         */
        describe("Given taken email", ()=>{
            it("shouldnt change the id", async()=>{
                const response = await request(app)
                    .patch(`/user`)
                    .send({ username: "tester", password: "test", email:process.env.TAKEN_EMAIL})
                    .set('Authorization', `Bearer ${accessToken}`); 
                expect(response.status).toBe(409);
            })
        })
        /**
         * Testing with invalid access token
         */
        describe("Given expired access token", ()=>{
            it("should return 403", async()=>{
                const response = await request(app)
                    .patch(`/user`)
                    .send({id:4, username: "tester", password: "test", email:"email@gmail.com"})
                    .set('Authorization', `Bearer 1234123412`); 
                expect(response.status).toEqual(403);
            })
        })
    })
    /**
     * Tests for DELETE requests
     */
    describe("DELETE REQUEST", ()=>{
        /**
         * Testing with valid access token
         */
        describe("Given a valid access token", ()=>{
            it("Should return 204", async()=>{
                const response = await request(app)
                    .delete(`/user`)
                    .set('Authorization', `Bearer ${accessToken}`)
                expect(response.status).toBe(204)
            })
        })
        /**
         * Testing with expired access token
         */
        describe("Given invalid token", ()=>{
            it("Should return 403", async()=>{
                const response = await request(app)
                    .delete('/user')
                    .set('Authorization', `Bearer validtoken`)
                expect(response.status).toBe(403)
            }) 
        })
    })
    
})
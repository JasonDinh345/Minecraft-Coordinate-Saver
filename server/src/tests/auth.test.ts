import { describe } from 'node:test'
import request from 'supertest'
import pool from "@/utils/db"
import dotenv from 'dotenv'
import { authApp } from '@/authServer';
import { Server } from 'node:http';
let server: Server
let authServer: Server
/**
 * Tester for auth and user routes
 */
dotenv.config()
/**
 * Prevents changes to db
 */
beforeAll(()=>{

    authServer = authApp.listen(2000)
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
/**
 * Resets the user id sequence and closes the server
 */
afterAll( async() => {
    await pool.end(); 
    await authServer.close()
});

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
import { describe } from 'node:test'
import request from 'supertest'
import {app} from '@/server'; 
import pool from "@/utils/db"
import {User} from "@/types/user/user.type"
import dotenv from 'dotenv'
import { Server } from 'node:http';
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
    await pool.end(); 
    await server.close(); 
});
describe("GET REQUEST", ()=>{
    describe("Given valid world id", ()=>{
        it("should return 200", async()=>{
            const response = await request(app).get(`/world/${process.env.TEST_WORLD_ID}`)
            expect(response.status).toBe(200)
        })
    })
})
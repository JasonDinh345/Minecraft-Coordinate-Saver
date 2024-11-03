import { describe } from 'node:test'
import request from 'supertest'
import app from '../server'; 

describe("Get all users", ()=>{
    it("should return 200", async()=>{
        const response = await request(app).get('/user'); 
        expect(response.status).toBe(200);
    })

describe("Get a user", ()=>{
    describe("Given id:1, should return 200", ()=>{
        it("should return 200", async()=>{
            const response = await request(app).get('/user/1'); 
            expect(response.status).toBe(200);
        })
    })
    describe("Given id:-1, should return 404", ()=>{
        it("should return 200", async()=>{
            const response = await request(app).get('/user/-1'); 
            expect(response.status).toBe(404);
        })
    })
})
})
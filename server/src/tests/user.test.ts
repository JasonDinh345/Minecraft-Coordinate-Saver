import { describe } from 'node:test'
import request from 'supertest'
import {app, server} from '@/server'; 
import pool from "@/utils/db"
import {User} from "@/types/user/user.type"
import dotenv from 'dotenv'

dotenv.config()

beforeEach(async () => {
    
    await pool.query('BEGIN;');
});
  
afterEach(async () => {
    await pool.query('ROLLBACK;');
    
});

afterAll(async () => {
    const response = await request(app).get('/user'); 
    await pool.query(`ALTER SEQUENCE ${process.env.USER_SEQUENCE} RESTART WITH ${response.body.length + 1};`)
    await pool.end(); 
    server.close(); 
});
  

describe("GET request for users", ()=>{
    

    

    describe("GET request for a user", ()=>{
        describe("Given a valid", ()=>{
            it("should return 200", async()=>{
                
                const response = await request(app).get(`/user/${process.env.TEST_USER_ID}`); 
                expect(response.status).toBe(200);
            })
        })
        
        describe("Given an invalid id", ()=>{
            it("should return 404", async()=>{
                const response = await request(app).get('/user/-1'); 
                expect(response.status).toBe(404);
            })
        })
            
    })
})


describe("POST REQUESTS", ()=>{
    let user : Omit<User, 'id' | 'created_at'>
    describe("Given valid user data",()=>{
        it("should return 201", async ()=>{
            user = {username: "john45", password: "123", email:"johnissocool345@test.com"}
            const response = await request(app).post('/user').send(user); 
                expect(response.status).toBe(201);
                expect(response.body).toEqual(expect.any(Object));
        })
    })
    describe("Given empty user data", ()=>{
        it("should return 400", async ()=>{
            user = {username: " ", password: "", email:""}
            const response = await request(app).post('/user').send(user); 
                expect(response.status).toBe(400);
        })    
    })
    describe("Given duplicate email", ()=>{
        it("should return 409", async ()=>{
            const user1 : Omit<User, 'id' | 'created_at'> = {username: "john45", password: "123", email:"johnissocool345@test.com"}
            user = {username: "john45", password: "3456", email:"johnissocool345@test.com"}
            await request(app).post('/user').send(user1); 
            const response = await request(app).post('/user').send(user); 
            expect(response.status).toBe(409);
        }) 
    })
})
describe("PATCH REQUEST", ()=>{
    describe("Given valid userdata", ()=>{
        it("should return 200", async()=>{
            const response = await request(app).patch(`/user/${process.env.TEST_USER_ID}`).send({ username: "tester", password: "test", email:"email@gmail.com" }); 
            expect(response.status).toBe(200);
      
        })
    })
    describe("Given an id and valid user data", ()=>{
        it("shouldnt change the id", async()=>{
            const response = await request(app).patch(`/user/${process.env.TEST_USER_ID}`).send({id:4, username: "tester", password: "test", email:"email@gmail.com"}); 
            expect(response.body.id).toEqual(Number(process.env.TEST_USER_ID));
        })
    })
    describe("Given taken email", ()=>{
        it("shouldnt change the id", async()=>{
            const response = await request(app).patch(`/user/${process.env.TEST_USER_ID}`).send({ username: "tester", password: "test", email:process.env.TAKEN_EMAIL}); 
            expect(response.status).toBe(409);
        })
    })
})
describe("DELETE REQUEST", ()=>{
    describe("Given a valid id", ()=>{
        it("Should return 204", async()=>{
            const response = await request(app).delete(`/user/${process.env.TEST_USER_ID}`)
            expect(response.status).toBe(204)
        })
    })
    describe("Given invalid id", ()=>{
        it("Should return 404", async()=>{
            const response = await request(app).delete('/user/-1')
            expect(response.status).toBe(404)
        }) 
    })
})

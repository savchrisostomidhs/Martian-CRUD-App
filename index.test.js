/* eslint-env node */
const request = require('supertest');
const mongoose = require('mongoose');
const app = require('./index');
process.env.NODE_ENV = 'test';

//Server instance
let server;

//Start server
beforeAll(() => {
    server = app.listen(3000);
});

describe('CRUD Test', () => {
    let testResource;

    //Post
    it('Create', async () => {
        const res = await request(app).post('/resources').send({
            name: 'Test',
            id: 1,
            quantity: 10
        });

        expect(res.status).toBe(201);
        expect(res.body.name).toBe('Test');
        testResource = res.body;
    });

    //Get
    it('Read', async () => {
        const res = await request(app).get('/resources');
        expect(res.status).toBe(200);
        expect(res.body.length).toBeGreaterThan(0);
    });

    //Get id
    it('Read id', async () => {
        const res = await request(app).get(`/resources/${testResource.id}`);
        expect(res.status).toBe(200);
        expect(res.body.name).toBe('Test');
    });

    //Patch
    it('Update', async () => {
        const res = await request(app).patch(`/resources/${testResource.id}`).send({
            quantity: 20
        });

        expect(res.status).toBe(200);
        expect(res.body.quantity).toBe(20);
    });

    //Delete
    it('Delete', async () => {
        const res = await request(app).delete(`/resources/${testResource.id}`);
        expect(res.status).toBe(204);
    });
});

//CLose MongoDB connection and server
afterAll(async () => {
    await mongoose.connection.close();
    await server.close();
});
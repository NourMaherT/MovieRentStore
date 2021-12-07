const request = require('supertest');
const {Genre} = require('../../../models/genre');
const {User} = require('../../../models/user');
const mongoose = require('mongoose');

describe('Auth test', () => {
    let server;
    let token;

    beforeEach(() => { 
        server = require('../../../index');
        token = new User().generateAuthToken();
    });
    afterEach( async () => {
        await Genre.deleteMany({});
        await server.close();
    });

    const exec = () => {
        return request(server)
                .post('/api/genres')
                .set('x-auth-token', token)
                .send({ name: 'genre' });
    };

    it('should return 401 if there is no token', async () => {
        token = '';

        const res = await exec();

        expect(res.status).toBe(401);
    });

    it('should return 400 if token is invaild', async () => {
        token = 'a';

        const res = await exec();

        expect(res.status).toBe(400);
    });

    it('should return 200 if token is vaild', async () => {
        const res = await exec();

        expect(res.status).toBe(200);
    });
});
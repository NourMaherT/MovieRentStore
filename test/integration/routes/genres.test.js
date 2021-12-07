const request = require('supertest');
const {Genre} = require('../../../models/genre');
const {User} = require('../../../models/user');
const mongoose = require('mongoose');


describe('/api/genres', () => {
    let server;
    beforeEach(() => { server = require('../../../index'); });
    afterEach( async () => { 
        await Genre.deleteMany({});
        await server.close();
    });

    describe('GET /', () => {
        it('should return my genres', async () => {
            await Genre.collection.insertMany([
                { name: 'genre1' },
                { name: 'genre2' }
            ]);

            const res = await request(server).get('/api/genres');
            expect(res.status).toBe(200);
            expect(res.body.length).toBe(2);
            expect(res.body.some(g => g.name === 'genre1')).toBeTruthy();
            expect(res.body.some(g => g.name === 'genre2')).toBeTruthy();
            
        });
    });

    describe('POST /', () => {
        let token;
        let name;

        const exec = () => {
            return request(server)
            .post('/api/genres')
            .set('x-auth-token', token)
            .send({ name: name });
        }

        beforeEach(() => {
            token = new User().generateAuthToken();
            name = 'genre';
        });

        it('should return 401 if the user is not logged in', async () => {
            token = '';

            const res = await exec();

            expect(res.status).toBe(401);
        });

        it('should return 400 if genre is less than 5 characters', async () => {
            name = 'ge';

            const res = await exec();

            expect(res.status).toBe(400);
        });

        it('should return 400 if genre is more than 50 characters', async () => {
            name = new Array(52).join('a');

            const res = await exec();

            expect(res.status).toBe(400);
        });

        it('should save genre if it is valid', async () => {
            exec();

            const genre = await Genre.find({name: 'genre'});

            expect(genre).not.toBeNull();
        });

        it('should return genre if it is valid', async () => {

            const res = await exec();

            expect(res.body).toHaveProperty('_id');
            expect(res.body).toHaveProperty('name', 'genre');
        });
    });

    describe('GET /:id', () => {
        it('should return genre if the passed id is vaild', async () => {
            const genre = new Genre({ name: 'genre' });
            await genre.save();
            
            const res = await request(server).get('/api/genres/'+genre._id);

            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('name','genre');
        });
        it('should return an error message if the passed id is invalid', async () => {
            const res = await request(server).get('/api/genres/1234');

            expect(res.status).toBe(404);
        });
    });

    describe('PUT /:id', () => {

        let token;
        let newName;
        let id;

        const exec = () => {
            return request(server)
            .put('/api/genres/'+ id)
            .set('x-auth-token', token)
            .send({ name: newName });
        }

        beforeEach( async () => {
            const genre = new Genre({ name: 'draft' });
            await genre.save();
            id = genre._id;
            token = new User().generateAuthToken();
            newName = 'genre1';
        });

        it('should return 401 if the user is not logged in', async () => {
            token = '';
            
            const res = await exec();
            
            expect(res.status).toBe(401);
        });
        
        it('should return an error message if the passed id is invalid', async () => {
            id = '1234';

            const res = await exec();

            expect(res.status).toBe(404);
        });
        
        it('should return an error message if genre of the passed id is not existed', async () => {
            id = mongoose.Types.ObjectId();

            const res = await exec();

            expect(res.status).toBe(404);
        });

        it('should return 400 if genre is less than 5 characters', async () => {
            newName = 'ge';

            const res = await exec();

            expect(res.status).toBe(400);
        });

        it('should return 400 if genre is more than 50 characters', async () => {
            newName = new Array(52).join('a');

            const res = await exec();

            expect(res.status).toBe(400);
        });

        it('should return the updated genre if it is valid', async () => {
            const res = await exec();

            expect(res.body).toHaveProperty('_id');
            expect(res.body).toHaveProperty('name', 'genre1');
        });
    });

    describe('DELETE /:id', () => {
        
        let token;
        let id;

        const exec = () => {
            return request(server)
            .delete('/api/genres/'+ id)
            .set('x-auth-token', token);
        }

        beforeEach( async () => {
            const genre = new Genre({ name: 'genre' });
            await genre.save();
            id = genre._id;
            token = new User({ isAdmin: true }).generateAuthToken();
        });

        it('should return 401 if the user is not logged in', async () => {
            token = '';
            
            const res = await exec();
            
            expect(res.status).toBe(401);
        });

        it('should return 404 if the passed id is invalid', async () => {
            id = '1234';

            const res = await exec();

            expect(res.status).toBe(404);
        });

        it('should return 403 if the user is not admin', async () => {
            token = new User({ isAdmin: false}).generateAuthToken();            

            const res = await exec();

            expect(res.status).toBe(403);
        });

        it('should return 404 if genre of the passed id is not existed', async () => {
            id = mongoose.Types.ObjectId();

            const res = await exec();

            expect(res.status).toBe(404);
        });

        it('should return the deleted genre if it is valid', async () => {
            const res = await exec();

            expect(res.body).toHaveProperty('_id');
            expect(res.body).toHaveProperty('name', 'genre');
        });

    });
});
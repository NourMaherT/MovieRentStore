const request = require('supertest');
const {Movie} = require('../../../models/movie');
const {Genre} = require('../../../models/genre');
const {User} = require('../../../models/user');
const mongoose = require('mongoose');



describe('/api/movies', () => {
    let server;
    let genreId;
    let genre;
    let movieId;
    let movie;

    beforeEach( async () => { 
        server = require('../../../index');
        movieId = mongoose.Types.ObjectId();
        genreId = mongoose.Types.ObjectId();

        genre = new Genre({
            _id: genreId,
            name: '12345'
        });
        await genre.save();

        movie = new Movie({
            _id: movieId, 
            title: 'movie',
            genre: { 
                _id: genreId,
                name: '12345'
            },
            numberInStock: 10,
            dailyRentalrate: 4
        });
        await movie.save();

    });
    afterEach( async () => { 
        await Movie.deleteMany({});
        await Genre.deleteMany({});
        await server.close();
    });

    describe('GET /', () => {
        it('should return all movies', async () => {

            const res = await request(server).get('/api/movies');
            expect(res.status).toBe(200);
            expect(res.body.length).toBe(1);
            expect(res.body.some(g => g.title === 'movie')).toBeTruthy();
            
        });
    });

    describe('POST /', () => {

        let token;
        let title;
        let genreId;
        let numberInStock;
        let dailyRentalrate;

        const exec = () => {
            return request(server)
            .post('/api/movies')
            .set('x-auth-token', token)
            .send({ title: title, genreId: genreId, numberInStock: numberInStock, dailyRentalrate: dailyRentalrate});
        }

        beforeEach( async () => {
            token = new User().generateAuthToken();
            title = 'movie';
            genreId = mongoose.Types.ObjectId();
            numberInStock = 4;
            dailyRentalrate = 2;
            await Genre.collection.insertOne({ _id: genreId, name: 'genre1' });
        });

        it('should return 401 if the user is not logged in', async () => {
            token = '';

            const res = await exec();

            expect(res.status).toBe(401);
        });

        it('should return 404 if the genreId is not valid', async () => {
            genreId = mongoose.Types.ObjectId();

            const res = await exec();

            expect(res.status).toBe(404);
        });

        it('should return 400 if movie is less than 3 characters', async () => {
            title = 'mo';

            const res = await exec();

            expect(res.status).toBe(400);
        });

        it('should return 400 if movie is more than 50 characters', async () => {
            title = new Array(52).join('a');

            const res = await exec();

            expect(res.status).toBe(400);
        });

        it('should save movie if it is valid', async () => {
            exec();

            const movie = await Movie.find({title: 'movie'});

            expect(movie).not.toBeNull();
        });

        it('should return movie if it is valid', async () => {

            const res = await exec();

            expect(res.body).toHaveProperty('_id');
            expect(res.body).toHaveProperty('title', 'movie');
        });
    });

    describe('GET /:id', () => {
        it('should return movies if the passed id is vaild', async () => {
            
            const res = await request(server).get('/api/movies/'+movieId);

            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('title','movie');
        });
        it('should return an error message if the passed id is invalid', async () => {
            const res = await request(server).get('/api/movies/1234');

            expect(res.status).toBe(404);
        });
    });

    describe('PUT /:id', () => {

        let token;
        let newtitle;
        let newNumberInStock;
        let newDailyRentalrate;
        let id;

        const exec = () => {
            return request(server)
            .put('/api/movies/'+ id)
            .set('x-auth-token', token)
            .send({ title: newtitle, genreId: genre._id, dailyRentalrate: newDailyRentalrate, numberInStock: newNumberInStock });
        }

        beforeEach( async () => {
            id = movie._id;
            token = new User().generateAuthToken();
            newtitle = 'movie1'
            newNumberInStock = 20;
            newDailyRentalrate= 10;
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

        it('should return 400 if customer is less than 5 characters', async () => {
            newtitle = 'mo';

            const res = await exec();

            expect(res.status).toBe(400);
        });

        it('should return 400 if customer is more than 50 characters', async () => {
            newtitle = new Array(52).join('a');

            const res = await exec();

            expect(res.status).toBe(400);
        });

        it('should return the updated customer if it is valid', async () => {
            const res = await exec();

            expect(res.body).toHaveProperty('_id');
            expect(res.body).toHaveProperty('title', 'movie1');
        });
    });

    describe('DELETE /:id', () => {
        
        let token;
        let id;

        const exec = () => {
            return request(server)
            .delete('/api/movies/'+ id)
            .set('x-auth-token', token);
        }

        beforeEach( async () => {
            id = movie._id;
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

        it('should return 404 if movie of the passed id is not existed', async () => {
            id = mongoose.Types.ObjectId();

            const res = await exec();

            expect(res.status).toBe(404);
        });

        it('should return the deleted movie if it is valid', async () => {
            const res = await exec();

            expect(res.body).toHaveProperty('_id');
            expect(res.body).toHaveProperty('title', 'movie');
        });

    });
});
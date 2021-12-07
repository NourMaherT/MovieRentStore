const moment = require('moment');
const request = require('supertest');
const {Rental} = require('../../../models/rental');
const {Customer} = require('../../../models/customer');
const {Movie} = require('../../../models/movie');
const {User} = require('../../../models/user');
const mongoose = require('mongoose');

describe('/api/rentals', () => {
    let server;
    let movie;
    let movieId;
    let customerId;
    let customer;

    beforeEach(async () => { 
        server = require('../../../index'); 
        customerId = mongoose.Types.ObjectId().toHexString();
        movieId = mongoose.Types.ObjectId().toHexString();
        genreId = mongoose.Types.ObjectId();
        
        movie = new Movie({
            _id: movieId, 
            title: 'qwert',
            genre: { 
                _id: genreId,
                name: '12345'
            },
            numberInStock: 10,
            dailyRentalrate: 4
        });
        await movie.save();

        customer = new Customer({
            _id: customerId,
            name: 'customer',
            phone: '12345',
            isGold: true
        });
        await customer.save();

    });
    afterEach( async () => { 
        await Rental.deleteMany({});
        await Customer.deleteMany({});
        await Movie.deleteMany({});
        await server.close();
    });

    describe('GET /', () => {
        it('should return all rentals', async () => {
            const rental = new Rental({
                customer: {
                    _id: customerId,
                    name: 'customer',
                    phone:'12345'
                },
                movie: {
                    _id: movieId,
                    title: 'qwert',
                    dailyRentalrate: 4,
                    numberInStock: 10
                }
            });
            await rental.save();
                   
            const res = await request(server).get('/api/rentals');
            expect(res.status).toBe(200);
            expect(res.body.length).toBe(1);
            
        });
    });

    describe('POST /', () => {
        let token;

        beforeEach(() => {
            token = new User().generateAuthToken();
        });
        

        const exec = () => {
            return request(server)
                .post('/api/rentals')
                .set('x-auth-token', token)
                .send({ customerId, movieId });
        }

        it('should return 401 if the user is not logged in', async () => {
            token ='';
            
            const res = await exec();
            expect(res.status).toBe(401);
        });
    
        it('should return 400 if customerId is not provided', async () => {
            customerId = '';
            
            const res = await exec();
            expect(res.status).toBe(400);
        });
    
        it('should return 400 if movieId is not provided', async () => {
            movieId = '';
            
            const res = await exec();
            expect(res.status).toBe(400);
       
        });

        it('should return 400 if the movie is not in stock', async () => {
            movie.numberInStock = 0;
            await movie.save();
            
            const res = await exec();
            expect(res.status).toBe(400);
       
        });

        it('should return 200 if valid request', async () => {

            const res = await exec();
            expect(res.status).toBe(200);
       
        });

        it('should return the rental', async () => {
            const res = await exec();

            expect(Object.keys(res.body)).toEqual(
                expect.arrayContaining(['dateOut', 'customer', 'movie', '_id']
                ));
       
        });

    });

});
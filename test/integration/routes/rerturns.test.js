const moment = require('moment');
const request = require('supertest');
const {Rental} = require('../../../models/rental');
const {Movie} = require('../../../models/movie');
const {User} = require('../../../models/user');
const mongoose = require('mongoose');

describe('/api/returns', () => {
    let server;
    let rental;
    let movie;
    let customerId;
    let movieId;

    beforeEach(async () => { 
        server = require('../../../index'); 
        customerId = mongoose.Types.ObjectId().toHexString();
        movieId = mongoose.Types.ObjectId().toHexString();
        genreId = mongoose.Types.ObjectId().toHexString();
        
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

        rental = new Rental({
            customer: {
                _id: customerId,
                name: '12345',
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
    });
    afterEach( async () => { 
        await Rental.deleteMany({});
        await Movie.deleteMany({});
        await server.close();
    });

    describe('POST /', () => {
        let token;

        beforeEach(() => {
            token = new User().generateAuthToken();
        });
        

        const exec = () => {
            return request(server)
                .post('/api/returns')
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
    
        it('should return 404 if no rental found for the customer/movie', async () => {
            await Rental.deleteMany({});

            const res = await exec();
            expect(res.status).toBe(404);
       
        });
    
        it('should return 400 if rental already processed', async () => {
            rental.dateReturned = Date.now();
            await rental.save();

            const res = await exec();
            expect(res.status).toBe(400);
       
        });

        it('should return 200 if valid request', async () => {

            const res = await exec();
            expect(res.status).toBe(200);
       
        });
        
        it('should set the return date if valid request', async () => {
            const res = await exec();

            const rentalInDb = await Rental.findById(rental._id);
            const diff = Date.now() - rentalInDb.dateReturned;
            expect(diff).toBeLessThan(10 * 1000);
       
        });

        it('should set the rental Fee if valid request', async () => {
            rental.dateOut = moment().add(-7, 'days');
            await rental.save();

            const res = await exec();

            const rentalInDb = await Rental.findById(rental._id);
            expect(rentalInDb.rentalFee).toBe(28);
       
        });

        it('should increase the stock if valid request', async () => {
            const res = await exec();

            const movieInDb = await Movie.findById(movieId);
            expect(movieInDb.numberInStock).toBe(movie.numberInStock + 1);
       
        });

        it('should return the rental', async () => {
            const res = await exec();

            expect(Object.keys(res.body)).toEqual(
                expect.arrayContaining(['dateOut', 'dateReturned', 'rentalFee', 'customer', 'movie']
                ));
        });

    });

});
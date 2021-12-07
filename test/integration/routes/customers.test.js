const request = require('supertest');
const {Customer} = require('../../../models/customer');
const {User} = require('../../../models/user');
const mongoose = require('mongoose');



describe('/api/customers', () => {
    let server;
    beforeEach(() => { server = require('../../../index'); });
    afterEach( async () => { 
        await Customer.deleteMany({});
        await server.close();
    });

    describe('GET /', () => {
        it('should return all customers', async () => {
            await Customer.collection.insertMany([
                { name: 'customer1', phone: '12345678' },
                { name: 'customer2', phone: '12345678' }
            ]);

            const res = await request(server).get('/api/customers');
            expect(res.status).toBe(200);
            expect(res.body.length).toBe(2);
            expect(res.body.some(g => g.name === 'customer1')).toBeTruthy();
            expect(res.body.some(g => g.name === 'customer2')).toBeTruthy();
            
        });
    });

    describe('POST /', () => {

        let token;
        let name;
        let phone;

        const exec = () => {
            return request(server)
            .post('/api/customers')
            .set('x-auth-token', token)
            .send({ name: name, phone: phone});
        }

        beforeEach(() => {
            token = new User().generateAuthToken();
            name = 'customer';
            phone = '12345678';
        });

        it('should return 401 if the user is not logged in', async () => {
            token = '';

            const res = await exec();

            expect(res.status).toBe(401);
        });

        it('should return 400 if customer is less than 3 characters', async () => {
            name = 'cu';

            const res = await exec();

            expect(res.status).toBe(400);
        });

        it('should return 400 if customer is more than 50 characters', async () => {
            name = new Array(52).join('a');

            const res = await exec();

            expect(res.status).toBe(400);
        });

        it('should save customer if it is valid', async () => {
            exec();

            const customer = await Customer.find({name: 'customer'});

            expect(customer).not.toBeNull();
        });

        it('should return customer if it is valid', async () => {

            const res = await exec();

            expect(res.body).toHaveProperty('_id');
            expect(res.body).toHaveProperty('name', 'customer');
        });
    });

    describe('GET /:id', () => {
        it('should return customer if the passed id is vaild', async () => {
            const customer = new Customer({ name: 'customer', phone: '12345678' });
            await customer.save();
            
            const res = await request(server).get('/api/customers/'+customer._id);

            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('name','customer');
        });
        it('should return an error message if the passed id is invalid', async () => {
            const res = await request(server).get('/api/customers/1234');

            expect(res.status).toBe(404);
        });
    });

    describe('PUT /:id', () => {

        let token;
        let newName;
        let newPhone;
        let id;

        const exec = () => {
            return request(server)
            .put('/api/customers/'+ id)
            .set('x-auth-token', token)
            .send({ name: newName, phone: newPhone});
        }

        beforeEach( async () => {
            const customer = new Customer({ name: 'draft' , phone: '87654321' });
            await customer.save();
            id = customer._id;
            token = new User().generateAuthToken();
            newName = 'customer1';
            newPhone= '12345678';
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
            newName = 'ge';

            const res = await exec();

            expect(res.status).toBe(400);
        });

        it('should return 400 if customer is more than 50 characters', async () => {
            newName = new Array(52).join('a');

            const res = await exec();

            expect(res.status).toBe(400);
        });

        it('should return the updated customer if it is valid', async () => {
            const res = await exec();

            expect(res.body).toHaveProperty('_id');
            expect(res.body).toHaveProperty('name', 'customer1');
            expect(res.body).toHaveProperty('phone', '12345678');
        });
    });

    describe('DELETE /:id', () => {
        
        let token;
        let id;

        const exec = () => {
            return request(server)
            .delete('/api/customers/'+ id)
            .set('x-auth-token', token);
        }

        beforeEach( async () => {
            const customer = new Customer({ name: 'customer' , phone: '87654321' });
            await customer.save();
            id = customer._id;
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

        it('should return 404 if customer of the passed id is not existed', async () => {
            id = mongoose.Types.ObjectId();

            const res = await exec();

            expect(res.status).toBe(404);
        });

        it('should return the deleted customer if it is valid', async () => {
            const res = await exec();

            expect(res.body).toHaveProperty('_id');
            expect(res.body).toHaveProperty('name', 'customer');
        });

    });
});
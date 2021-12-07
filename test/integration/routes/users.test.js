const request = require('supertest');
const {User} = require('../../../models/user');
const mongoose = require('mongoose');


describe('/api/users', () => {
    let server;
    beforeEach(() => { server = require('../../../index'); })
    
    afterEach( async () => { 
        await User.deleteMany({});
        await server.close();
    });

    describe('GET /me', () => {
        let user;
        let token;
        let userId;
        beforeEach( async () => { 
            userId = mongoose.Types.ObjectId().toHexString();
            user = new User({
                _id: userId,
                name: 'user1',
                email: 'qwasnwara123@gmail.com',
                password: 'qwasnwara8*N'
            })
            await user.save();
            token = user.generateAuthToken();
         });

        const exec = () => {
            return request(server)
            .get('/api/users/me')
            .set('x-auth-token', token);
        }

        it('should return 401 if the user is not logged in', async () => {
            token = '';

            const res = await exec();

            expect(res.status).toBe(401);
        });

        it('should return my information', async () => {
            const res = await exec();

            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('email');
            
        });
    });

    describe('POST /', () => {
        let user;
        let userId;
        let name;
        let email;
        let password;
        beforeEach( async () => { 
            userId = mongoose.Types.ObjectId().toHexString();
            name = 'user1';
            email = 'qwasnwara123@gmail.com';
            password = 'qwasnwara8*N';
         });

        const exec = () => {
            return request(server)
            .post('/api/users/register')
            .send({ name: name, email: email, password: password });
        }

        it('should return 400 if name is less than 5 characters', async () => {
            name = 'ge';

            const res = await exec();

            expect(res.status).toBe(400);
        });

        it('should return 400 if name is more than 50 characters', async () => {
            name = new Array(52).join('a');

            const res = await exec();

            expect(res.status).toBe(400);
        });

        it('should return 400 if email is already existed', async () => {
            const user1 = new User({
                _id: userId,
                name: 'user1',
                email: 'qwasnwara123@gmail.com',
                password: 'qwasnwara8*N'
            })
            await user1.save();

            const res = await exec();

            expect(res.status).toBe(400);
        });

        it('should return 400 if email is not valid', async () => {
            email = 'e';

            const res = await exec();

            expect(res.status).toBe(400);
        });

        it('should return 400 if name is more than 255 characters', async () => {
            const e_name = new Array(257).join('a');
            email = e_name+'@gmail.com';

            const res = await exec();

            expect(res.status).toBe(400);
        });

        it('should return 400 if password is less than 8 characters', async () => {
            password = 'qwQW12!';

            const res = await exec();

            expect(res.status).toBe(400);
        });

        it('should return 400 if password is more than 255 characters', async () => {
            const p_name = new Array(257).join('a');
            password = p_name+'qwQW12!';

            const res = await exec();

            expect(res.status).toBe(400);
        });

        it('should return 400 if password does not have at least one lowercase', async () => {
            password = '123QW12!!';

            const res = await exec();

            expect(res.status).toBe(400);
        });

        it('should return 400 if password does not have at least one uppercase', async () => {
            password = '123qw12!!';

            const res = await exec();

            expect(res.status).toBe(400);
        });

        it('should return 400 if password does not have at least one number', async () => {
            password = 'QWEqwqw!!';

            const res = await exec();

            expect(res.status).toBe(400);
        });

        it('should return 400 if password does not have at least one symbol', async () => {
            password = 'QWEqwqw11';

            const res = await exec();

            expect(res.status).toBe(400);
        });

        it('should save user if it is valid', async () => {
            exec();

            const user = await User.find({name: 'user1'});

            expect(user).not.toBeNull();
        });

        it('should return user if it is valid', async () => {

            const res = await exec();

            expect(res.body).toHaveProperty('_id');
            expect(res.body).toHaveProperty('name', 'user1');
        });
    });
});
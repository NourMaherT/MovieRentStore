const auth = require('../../../middleware/auth')
const {User} = require('../../../models/user');
const mongoose = require('mongoose');

describe('Auth middleware', () => {
    it('should populate req.user with the valid JWT', () => {
        const user = {
            _id: mongoose.Types.ObjectId().toHexString(),
            isAdmin: true
        };
        const token = new User(user).generateAuthToken();

        const req = {
            header: jest.fn().mockReturnValue(token)
        };
        const res = {};
        const next = jest.fn();

        auth(req, res, next);
        expect(req.user).toMatchObject(user);
    });
});

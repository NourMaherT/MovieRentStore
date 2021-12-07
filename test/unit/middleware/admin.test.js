const admin = require('../../../middleware/admin')
const mongoose = require('mongoose');

describe('Admin middleware', () => {
    const scenarios = [
        {
          description: 'should return error 403 if user is not admin',
          error: 'Acsess Denied',
          status: 403
        }
      ];
    scenarios.forEach(({ description, error, status }) => {
        it(description, async () => {
            const user = {
                _id: mongoose.Types.ObjectId().toHexString(),
                isAdmin: false
            };
    
            const req = { user };
            const res = {
                send: jest.fn(),
                status: jest.fn(() => res)
              };
            const next = jest.fn();
    
            await admin(req, res, next);
            expect(res.status).toBeCalledWith(status);
            expect(res.send.mock.calls[0][0]).toMatchSnapshot();
        });
    });

});

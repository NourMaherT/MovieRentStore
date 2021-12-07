const validateObjectId = require('../../../middleware/validateObjectId');
const mongoose = require('mongoose');

describe('ValidateObjectId middleware', () => {
    const scenarios = [
        {
          description: 'should return error 404 if object id is not vaild',
          error: 'Invalid ID',
          status: 404
        }
      ];
    scenarios.forEach(({ description, error, status }) => {
        it(description, async () => {
            const req = { 
                params: {
                    id: '1'
                }
            };
            const res = {
                send: jest.fn(),
                status: jest.fn(() => res)
              };
            const next = jest.fn();
            const validator = jest.fn().mockReturnValue(error);
    
            await validateObjectId(req, res, next);
            expect(res.status).toBeCalledWith(status);
            expect(res.send.mock.calls[0][0]).toMatchSnapshot();
        });
    });

});

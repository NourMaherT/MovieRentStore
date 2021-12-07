const err = require('../../../middleware/error')

describe('Error middleware', () => {
    const scenarios = [
        {
          description: 'should return error 500 if somthing failed',
          error: 'Somthing Failed.',
          status: 500
        }
      ];
    scenarios.forEach(({ description, error, status }) => {
        it(description, async () => {
            const error = {
                message: 'Error message'
            };
            const req = {};
            const res = {
                send: jest.fn(),
                status: jest.fn(() => res)
              };
            const next = jest.fn();
    
            await err(error, req, res, next);
            expect(res.status).toBeCalledWith(status);
            expect(res.send.mock.calls[0][0]).toMatchSnapshot();
        });
    });

});

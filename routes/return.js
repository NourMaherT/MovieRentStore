const Joi = require('joi');
const auth = require('../middleware/auth');
const asyncMiddleWare = require('../middleware/async');
const validate = require('../middleware/validate');
const {Rental} = require('../models/rental');
const {Movie} = require('../models/movie');
const express = require('express');
const returnRouter = express.Router();

returnRouter.use(express.json());


returnRouter.post('/', [auth, validate(validateReturn)], asyncMiddleWare(async (req, res, next) => {

    const rental = await Rental.lookup(req.body.customerId, req.body.movieId);
    
    if(!rental) return res.status(404).send('Not found.');

    if(rental.dateReturned) return res.status(400).send('Already processed');
    
    rental.return();
    await rental.save();

    const movie = await Movie.updateOne({ _id: req.body.movieId }, {
        $inc: { numberInStock: 1}
    });
    return res.send(rental);

}));


function validateReturn(request) {
    const schema = Joi.object({
        customerId:Joi.objectId().required(),
        movieId:Joi.objectId().required()
    })
    return schema.validate(request)
}

module.exports = returnRouter;


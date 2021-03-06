const validateObjectId = require('../middleware/validateObjectId');
const asyncMiddleWare = require('../middleware/async');
const validate = require('../middleware/validate');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const { Customer, validateCustomer } = require('../models/customer');
const mongoose = require('mongoose');
const express = require('express');
const customerRouter = express.Router();
customerRouter.use(express.json());



customerRouter.get('/',asyncMiddleWare( async (req, res) => {
    const customer = await Customer.find().sort('name');
    res.send(customer);
}));

customerRouter.post('/', [auth, validate(validateCustomer)], asyncMiddleWare( async (req, res) => {

    const customer = new Customer({
        name: req.body.name,
        phone: req.body.phone,
        isGold: req.body.isGold
    });
    await customer.save();

    res.send(customer);
}));

customerRouter.get('/:id', validateObjectId, asyncMiddleWare( async (req, res) => {
    const customer = await Customer.findById(req.params.id);
    if(!customer) return res.status(404).send('The customer you are asking for is not available!');
    res.send(customer);
}));


customerRouter.put('/:id', validateObjectId, [auth, validate(validateCustomer)], asyncMiddleWare( async (req, res) => {

    const customer = await Customer.findByIdAndUpdate(req.params.id,
         { $set: {name: req.body.name,
                    phone: req.body.phone,
                    isGold: req.body.isGold}  },
         {new: true});
    if(!customer) return res.status(404).send('The customer you are asking for is not available!');

    
    res.send(customer);
}));

customerRouter.delete('/:id', validateObjectId, [auth, admin], asyncMiddleWare( async (req, res) => {
    const customer = await Customer.findByIdAndRemove(req.params.id);
    if(!customer) return res.status(404).send('The customer you are asking for is not available!');

    res.send(customer);
}));



module.exports = customerRouter;
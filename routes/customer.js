const { Customer, validateCustomer } = require('../models/customer') 
const mongoose = require('mongoose')
const express = require('express')
const customerRouter = express.Router()
customerRouter.use(express.json())



customerRouter.get('/', async (req, res) => {
    const customer = await Customer.find().sort('name')
    res.send(customer)
})

customerRouter.post('/', async (req, res) => {
    const { error } = validateCustomer(req.body)
    if(error) return res.status(400).send(error.details[0].message)

    const customer = new Customer({
        name: req.body.name,
        phone: req.body.phone,
        isGold: req.body.isGold
    })
    await customer.save()

    res.send(customer)
})

customerRouter.get('/:id', async (req, res) => {
    const customer = await Customer.findById(req.params.id)
    if(!customer) return res.status(404).send('The customer you are asking for is not available!')
    res.send(customer)
})


customerRouter.put('/:id', async (req, res) => {
    const { error } = validateCustomer(req.body)
    if(error) return res.status(400).send(error.details[0].message)

    const customer = await Customer.findByIdAndUpdate(req.params.id,
         { $set: {name: req.body.name,
                    phone: req.body.phone,
                    isGold: req.body.isGold}  },
         {new: true})
    if(!customer) return res.status(404).send('The customer you are asking for is not available!')

    
    res.send(customer)
})

customerRouter.delete('/:id', async (req, res) => {
    const customer = await Customer.findByIdAndRemove(req.params.id)
    if(!customer) return res.status(404).send('The customer you are asking for is not available!')

    res.send(customer)
})



module.exports = customerRouter
const config = require('config')
const _ = require('lodash')
const Joi = require('joi')
const jwt = require('jsonwebtoken')
const PasswordComplexity = require('joi-password-complexity')
const bcrypt = require('bcrypt')
const express = require('express')
const mongoose = require('mongoose')
const { User } = require('../models/user')

const authRouter = express.Router()
authRouter.use(express.json())


authRouter.post('/', async (req, res) => {
    const { error } = validateUser(req.body)
    if(error) return res.status(400).send(error.details[0].message)

    let user = await User.findOne({ email: req.body.email })
    if(!user) return res.status(400).send('Invalid email or password.')
    
    const valid = await bcrypt.compare(req.body.password, user.password)
    if(!valid) return res.status(400).send('Invalid email or password.')

    const token = user.generateAuthToken()
    res.send(token)
    
})


function validateUser(user) {
    const schema = Joi.object({
        email: Joi.string().min(0).max(255).required().email(),
        password: new PasswordComplexity({
            min: 8,
            max: 25,
            lowerCase: 1,
            upperCase: 1,
            numeric: 1,
            symbol: 1,
            requirementCount: 4
          })
    })
    return schema.validate(user)
}

module.exports = authRouter
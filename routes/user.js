const auth = require('../middleware/auth')
const _ = require('lodash')
const bcrypt = require('bcrypt')
const express = require('express')
const mongoose = require('mongoose')
const {User, validateUser } = require('../models/user')

const userRouter = express.Router()
userRouter.use(express.json())

userRouter.get('/me', auth, async (req, res) => {
    const user = await User.findById(req.user._id).select('-password')
    res.send(user)
})

userRouter.post('/register', async (req, res) => {
    const { error } = validateUser(req.body)
    if(error) return res.status(400).send(error.details[0].message)

    let user = await User.findOne({ email: req.body.email })
    if(user) return res.status(400).send('User is alresdy existed!')

    user = new User(_.pick(req.body, ['name', 'email', 'password']))
    
    const salt = await bcrypt.genSalt(10)
    user.password = await bcrypt.hash(user.password, salt)

    const token = user.generateAuthToken()
    await user.save()
    res.header('x-auth-token', token).send(_.pick(user, ['_id', 'name', 'email']))
})

module.exports = userRouter
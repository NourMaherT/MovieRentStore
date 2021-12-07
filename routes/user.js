const validateObjectId = require('../middleware/validateObjectId');
const asyncMiddleWare = require('../middleware/async');
const auth = require('../middleware/auth');
const validate = require('../middleware/validate');
const _ = require('lodash');
const bcrypt = require('bcrypt');
const express = require('express');
const mongoose = require('mongoose');
const {User, validateUser } = require('../models/user');

const userRouter = express.Router();
userRouter.use(express.json());

userRouter.get('/me', auth, asyncMiddleWare( async (req, res) => {
    const user = await User.findById(req.user._id).select('-password');
    res.send(user);
}));

userRouter.post('/register', validate(validateUser),asyncMiddleWare( async (req, res) => {

    let user = await User.findOne({ email: req.body.email });
    if(user) return res.status(400).send('User is alresdy existed!');

    user = new User(_.pick(req.body, ['name', 'email', 'password']));
    
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);

    const token = user.generateAuthToken();
    await user.save();
    res.header('x-auth-token', token).send(_.pick(user, ['_id', 'name', 'email']));
}));


module.exports = userRouter;
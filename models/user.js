const Joi = require('joi')
const config = require('config')
const jwt = require('jsonwebtoken')
const PasswordComplexity = require('joi-password-complexity')
const monggose = require('mongoose')

const userSchema = new monggose.Schema({
    name: {
        type: String,
        minlength: 5,
        maxlength: 50,
        required: true
    },
    email: {
        type: String,
        unique: true,
        minlength: 0,
        maxlength: 255,
        required: true
    },
    password: {
        type: String,
        minlength: 8,
        maxlength: 255,
        required: true
    },
    isAdmin: Boolean
    })
    
    userSchema.methods.generateAuthToken = function() {
        const token = jwt.sign({ _id: this._id, isAdmin: this.isAdmin }, config.get('jwtPrivateKey'))
        return token
    }

const User = monggose.model('User', userSchema)

function validateUser(user) {
    const schema = Joi.object({
        name: Joi.string().min(5).max(50).required(),
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


exports.User = User
exports.validateUser = validateUser

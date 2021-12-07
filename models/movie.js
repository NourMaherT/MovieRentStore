const Joi = require('joi');
const mongoose = require('mongoose');
const validate = require('mongoose-validator');
const {genreSchema} = require('./genre');


const nameValidator = [
    validate({
      validator: 'isLength',
      arguments: [3, 50],
      message: 'Name should be between {ARGS[0]} and {ARGS[1]} characters',
    }),
    validate({
      validator: 'isAlphanumeric',
      passIfEmpty: true,
      message: 'Name should contain alpha-numeric characters only',
    }),
  ];



const Movie = mongoose.model('Movie', new mongoose.Schema({
        title: {
            type: String,
            validate: nameValidator
        },
        genre:{
            type: genreSchema,
            required: true
        },
        numberInStock: {
            type: Number,
            required: true,
            min: 0,
            max: 255,
            default: 0
        },
        dailyRentalrate: {
            type: Number,
            required: true,
            min: 0,
            max: 255,
            default: 0
        }
    })
);


function validateMovie(movie) {
    const schema = Joi.object({
        title: Joi.string().min(3).max(50).required(),
        genreId: Joi.objectId().required(),
        numberInStock: Joi.number().min(0).max(255).required(),
        dailyRentalrate: Joi.number().min(0).max(255).required()
    })
    return schema.validate(movie)
}


exports.Movie = Movie;
exports.validateMovie = validateMovie;
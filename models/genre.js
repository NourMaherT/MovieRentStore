const Joi = require('joi');
const mongoose = require('mongoose');
const validate = require('mongoose-validator');


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

const genreSchema = new mongoose.Schema({
    name: {
        type:String,
        validate: nameValidator
    }
});

const Genre = mongoose.model('Genre', genreSchema);


function validateGenre(genre) {
    const schema = Joi.object({
        name: Joi.string()
                .min(5)
                .max(50)
                .required()
    })
    return schema.validate(genre)
}

exports.Genre = Genre;
exports.genreSchema = genreSchema;
exports.validateGenre = validateGenre;
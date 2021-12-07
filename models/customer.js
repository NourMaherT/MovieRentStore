const validate = require('mongoose-validator');
const Joi = require('joi');
const mongoose = require('mongoose');


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

  const Customer = mongoose.model('Customer', new mongoose.Schema({
        name: {
            type: String,
            validate: nameValidator,
            required: true
        },
        phone: {
            type: String,
            required: true
        },
        isGold: {
            type: Boolean,
            default: false
        }
    })
  );

  function validateCustomer(customer) {
    const schema = Joi.object({
        name: Joi.string()
                .min(3)
                .max(50)
                .required(),
        phone: Joi.string()
                .min(3)
                .max(255)
                .required(),
        isGold: Joi.boolean()
    })
    return schema.validate(customer)
}

exports.Customer = Customer;
exports.validateCustomer = validateCustomer;
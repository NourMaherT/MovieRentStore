const Joi = require('joi')
const mongoose = require('mongoose')

const Rental = mongoose.model('Rental', new mongoose.Schema({
        customer: {
            type: new mongoose.Schema({
                name: {
                    type: String,
                    minlength: 0,
                    maxlength: 255,
                    required: true
                },
                isGold: {
                    type: Boolean,
                    default: false
                },
                phone: {
                    type: String,
                    required: true,
                    minlength: 0,
                    maxlength: 255
                }
            }),
            required: true
        },
        movie: {
            type: new mongoose.Schema({
                title: {
                    type: String,
                    minlength: 0,
                    maxlength: 255,
                    required: true
                },
                dailyRentalrate: {
                    type: Number,
                    required: true,
                    min: 0,
                    max: 255
                },
                numerInStock: {
                    type: Number,
                    required: true,
                    min: 0,
                    max: 255
                }
            }),
            required: true
        },
        dateOut: {
            type: Date,
            required: true,
            default: Date.now()
        },
        dateReturned: {
            type: Date
        },
        rentalFee: {
            type: Number,
            min: 0
        }    

    })
)

function validateRental(rental) {
    const schema = Joi.object({
        customerId:Joi.objectId().required(),
        movieId:Joi.objectId().required()
    })
    return schema.validate(rental)
}


exports.Rental = Rental
exports.validateRental = validateRental
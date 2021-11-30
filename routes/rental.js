const express = require('express')
const mongoose = require('mongoose')
const Fawn = require('fawn')
const {Rental, validateRental } = require('../models/rental')
const {Customer} = require('../models/customer')
const {Movie} = require('../models/movie')

const rentalRouter = express.Router()
rentalRouter.use(express.json())
Fawn.init('mongodb://localhost/vidly')


rentalRouter.get('/', async (req, res) => {
    const rentals = await Rental.find().sort('-dateOut')
    res.send(rentals)
})
rentalRouter.post('/', async (req, res) => {
    const { error } = validateRental(req.body)
    if(error) return res.status(400).send(error.details[0].message)

    const customer = await Customer.findById(req.body.customerId)
    if(!customer) return res.status(400).send('Invalid Customer.')

    const movie = await Movie.findById(req.body.movieId)
    if(!movie) return res.status(400).send('Invalid Movie.')

    if(movie.numberInStock === 0) return res.status(400).send('Movie not in stock.')

    const rental = new Rental({
        customer: {
            _id: req.body.customerId,
            name: customer.name,
            phone: customer.phone
        },
        movie: {
            _id: req.body.movieId,
            title: movie.title,
            dailyRentalrate: movie.dailyRentalrate
        }
    })
    try{
        new Fawn.Task()
                .save('rentals',rental)
                .update('movies', { _id: movie._id }, { $inc: { numberInStock: -1 } })
                .run()
    
        res.send(rental)
    }
    catch(error) {
        res.status(500).send(error.message)
    }
})


module.exports = rentalRouter
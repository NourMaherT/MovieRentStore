const express = require('express')
const mongoose = require('mongoose')
const {Movie, validateMovie } = require('../models/movie')
const {Genre, validateGenre } = require('../models/genre')
const movieRouter = express.Router()

movieRouter.use(express.json())


movieRouter.get('/', async (req, res) => {
    const movies = await Movie.find().sort('name')
    res.send(movies)
})

movieRouter.post('/', async (req, res) => {
    const { error } = validateMovie(req.body)
    if(error) return res.status(400).send(error.details[0].message)

    const genre = await Genre.findById(req.body.genreId)
    if(!genre) return res.status(404).send('Invalid Genre!  ')

    const movie = new Movie({
        title: req.body.title,
        genre: {
            _id: genre._id,
            name: genre.name
        },
        numberInStock: req.body.numberInStock,
        dailyRentalrate: req.body.dailyRentalrate
    })
    await movie.save()

    res.send(movie)
})

movieRouter.get('/:id', async (req, res) => {
    const movie = await Movie.findById(req.params.id)
    if(!movie) return res.status(404).send('The Movie you are asking for is not available!')
    res.send(movie)
})


movieRouter.put('/:id', async (req, res) => {
    const { error } = validateMovie(req.body)
    if(error) return res.status(400).send(error.details[0].message)

    const genre = await Genre.findById(req.body.genreId)
    if(!genre) return res.status(404).send('Invalid Genre! ')

    const movie = await Movie.findByIdAndUpdate(req.params.id,
         { $set: { title: req.body.title,
                    genre: {
                        name: genre.name
                    },
                    numberInStock: req.body.numberInStock,
                    dailyRentalrate: req.body.dailyRentalrate } },
          { new: true })
    if(!movie) return res.status(404).send('The Movie you are asking for is not available!')

    
    res.send(movie)
})

movieRouter.delete('/:id', async (req, res) => {
    const movie = await Movie.findByIdAndRemove(req.params.id)
    if(!movie) return res.status(404).send('The Movie you are asking for is not available!')
    res.send(movie)
})



module.exports = movieRouter
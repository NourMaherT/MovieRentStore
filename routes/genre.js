const validateObjectId = require('../middleware/validateObjectId')
const asyncMiddleWare = require('../middleware/async')
const auth = require('../middleware/auth')
const admin = require('../middleware/admin')
const express = require('express')
const mongoose = require('mongoose')
const {Genre, validateGenre } = require('../models/genre')
const genreRouter = express.Router()

genreRouter.use(express.json())


genreRouter.get('/',asyncMiddleWare(async (req, res, next) => {
    const genres = await Genre.find().sort('name')
    res.send(genres)
}))

genreRouter.post('/', auth, async (req, res) => {
    const { error } = validateGenre(req.body)
    if(error) return res.status(400).send(error.details[0].message)

    const genre = new Genre({
        name: req.body.name
    })
    await genre.save()

    res.send(genre)
})

genreRouter.get('/:id', validateObjectId, async (req, res) => {
    const genre = await Genre.findById(req.params.id)
    if(!genre) return res.status(404).send('The genre you are asking for is not available!')
    res.send(genre)
})


genreRouter.put('/:id', async (req, res) => {
    const { error } = validateGenre(req.body)
    if(error) return res.status(400).send(error.details[0].message)

    const genre = await Genre.findByIdAndUpdate(req.params.id, { $set: { name: req.body.name } }, {new: true})
    if(!genre) return res.status(404).send('The genre you are asking for is not available!')

    
    res.send(genre)
})

genreRouter.delete('/:id', [auth, admin ], async (req, res) => {
    const genre = await Genre.findByIdAndRemove(req.params.id)
    if(!genre) return res.status(404).send('The genre you are asking for is not available!')

    res.send(genre)
})



module.exports = genreRouter
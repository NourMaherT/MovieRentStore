const express = require('express');
const users = require('../routes/user');
const auth = require('../routes/auth');
const customers = require('../routes/customer');
const genres = require('../routes/genre');
const movies = require('../routes/movie');
const rentals = require('../routes/rental');
const returns = require('../routes/return');
const err = require('../middleware/error');


module.exports = function(app) {
    app.use('/api/users', users);
    app.use('/api/auth', auth);
    app.use('/api/customers', customers);
    app.use('/api/genres', genres);
    app.use('/api/movies', movies);
    app.use('/api/rentals', rentals);
    app.use('/api/returns', returns);
    app.use(err);
}
const winston = require('winston')
// require('winston-mongodb')
require('express-async-errors')


module.exports = function() {
    winston.add(new winston.transports.File({filename: 'logFile.log'}))
    // winston.add(new winston.transports.MongoDB({
    //     db: 'mongodb://localhost/vidly',
    //     level: 'info'
    // }))

    // winston.exceptions.handle(
    //     new winston.transports.Console({ colorize:true, prettyPrint: true, handleExceptions: true }),
    //     new winston.transports.File({filename: 'exceptionFile.log', exitOnError: true}))
    
    
    // process.on('unhandledRejection', (ex) => {
    //     console.log('Hi we caught an unhandledRejection ')
    //     throw(ex)
    // })
    // .on('uncaughtException', (ex) => {
    //     console.log('Opss2')
    //     winston.error(ex.message, ex)
    //     process.exit(1)
    // })

 
}

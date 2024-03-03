require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')

// This will require the module from the file,
const PhoneNumber = require('./models/phoneNumber')

const app = express()

// const logger = morgan("tiny");

// Custom logger
const customLogger = morgan((tokens, req, res) => {
    let logs = [
        tokens.method(req, res),
        tokens.url(req, res),
        tokens.status(req, res),
        tokens.res(req, res, 'content-length'),
        '-',
        tokens['response-time'](req, res),
        'ms',
    ]

    if (tokens.method(req, res) === 'POST') {
        logs = logs.concat(JSON.stringify(req.body))
    }

    return logs.join(' ')
})

// Middleware
app.use(express.static('dist'))
app.use(cors())
app.use(express.json())
app.use(customLogger)

// GET info

app.get('/info', (request, response) => {
    PhoneNumber.find({}).then((result) => {
        response.send(
            `
    <p>Phonebook has info for ${result.length} people</p>
    <p>${new Date()}</p>
    `
        )
    })
})

// GET all Persons
app.get('/api/persons', (request, response) => {
    PhoneNumber.find({}).then((result) => {
        response.json(result)
    })
})

// GET single Person
app.get('/api/persons/:id', (request, response, next) => {
    PhoneNumber.findById(request.params.id)
        .then((phoneNumber) => response.json(phoneNumber))
        .catch((error) => next(error))
})

// POST single Person
app.post('/api/persons', (request, response, next) => {
    const content = request.body
    const person = new PhoneNumber({
        name: content.name,
        number: content.number,
    })
    person
        .save()
        .then((savedPerson) => {
            response.json(savedPerson)
        })
        .catch((error) => next(error))
})

app.put('/api/persons/:id', (request, response, next) => {
    const { name, number } = request.body

    PhoneNumber.findByIdAndUpdate(
        request.params.id,
        { name, number },
        { new: true, runValidators: true, context: 'query' }
    )
        .then((updatedPhoneNumber) => {
            response.json(updatedPhoneNumber)
        })
        .catch((error) => next(error))
})

// DELETE single Person
app.delete('/api/persons/:id', (request, response, next) => {
    PhoneNumber.findByIdAndDelete(request.params.id)
        .then(() => {
            response.status(204).end()
        })
        .catch((error) => next(error))
})

// Catch all
const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
    console.error(error.message)

    if (error.name === 'CastError') {
        return response.status(400).send({ error: 'malformatted id' })
    } else if (error.name === 'ValidationError') {
        return response.status(400).send({ error: error })
    }

    next(error)
}

app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})

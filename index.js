require('dotenv').config()

const express = require('express')
const app = express()
const morgan = require('morgan')
const cors = require('cors')
const Phone = require('./models/phone')

morgan.token('body', (request) => JSON.stringify(request.body))

app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))
app.use(express.json())
app.use(cors())
app.use(express.static('dist'))


let persons = [
    {
        "id": 1,
        "name": "Arto Hellas",
        "number": "040-123456"
    },
    {
        "id": 2,
        "name": "Ada Lovelace",
        "number": "39-44-5323523"
    },
    {
        "id": 3,
        "name": "Dan Abramov",
        "number": "12-43-234345"
    },
    {
        "id": 4,
        "name": "Mary Poppendieck",
        "number": "39-23-6423122"
    }
]

app.get('/info', (request, response) =>{    
    Phone.find({}).then(phone => {
        const people = phone.length
        const date = new Date()

        response.send(`<p>Phonebook has info for ${people} people</p> <p>${date}</p>`)
    })
})

app.get('/api/persons', (request, response) => {
    Phone.find({}).then(phone => {
        response.json(phone)
    })
})

app.get('/api/persons/:id', (request, response, next) => {
    Phone.findById(request.params.id)
        .then(phone => {
            if(phone){
                response.json(phone)
            } else {
                response.status(404).end()
            }
    })
        .catch(error => next(error))
})

app.delete('/api/persons/:id', (request, response) => {
    Phone.findByIdAndDelete(request.params.id)
        .then(result =>{
            response.status(204).end()
        })
        .catch(error => next(error))
})

const generateID = () => {
    function getRandomInt(max) {
        return Math.floor(Math.random() * max)
    }

    const newId = getRandomInt(99)

    return newId
}

app.post('/api/persons', (request, response) => {
    const body = request.body

    if(!body.number || !body.name) {
        return response.status(404).json({ error: 'name or number missing' })
    }

    if(body.name.length < 3) {
        return response.status(404).json({ error: 'name must be at least 3 characters long' })
    }
    
    const phone = new Phone ({
        name: body.name,
        number: body.number
    })

    phone.save().then(savedPhone => {
        response.json(savedPhone)
    })
})

app.put('/api/persons/:id', (request, response, next) => {
    const body = request.body

    const phone = {
        name: body.name,
        number: body.number,
    }

    Phone.findByIdAndUpdate(request.params.id, phone, { new: true })
        .then(updatedPhone => {
            response.json(updatedPhone)
        })
        .catch(error => next(error))
})

const errorHandler = (error, request, response, next) => {
    console.error(error.message)

    if(error.name === 'CastError') {
        return response.status(400).send({ error: 'malformatted id' })
    }

    next(error)
}

app.use(errorHandler)

const PORT = process.env.PORT || 3001
app.listen(PORT, () =>  {
    console.log(`Server running on port ${PORT}`)
})
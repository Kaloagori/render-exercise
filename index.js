const express = require('express')
const app = express()
const morgan = require('morgan')
const cors = require('cors')

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
    const people = persons.length
    const date = new Date()

    response.send(`<p>Phonebook has info for ${people} people</p> <p>${date}</p>`)
})

app.get('/api/persons', (request, response) => {
    response.json(persons)
})

app.get('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    const person = persons.find(person => person.id === id)

    if (person) {
        response.json(person)
    } else {
        response.status(404).end()
    }
})

app.delete('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    persons = persons.filter(person => person.id !== id)

    response.status(204).end()
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
        return response.status(400).json({
            error: 'name or number missing'
        })
    }

    const names = persons.map(person => person.name)

    if(names.includes(body.name)){
        return response.status(400).json({
            error: 'name must be unique'
        })
    }

    const person = {
        id: generateID(),
        name: body.name,
        number: body.number,
    }

    persons = persons.concat(person)

    response.json(person)
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () =>  {
    console.log(`Server running on port ${PORT}`)
})
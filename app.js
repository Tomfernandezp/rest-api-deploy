const express = require('express') // require -->commonJS
const crypto = require('node:crypto') // para crear ID únicas
const cors = require('cors')
const movies = require('./movies.json')
const { validateMovie, validateParcialMovie } = require('./Schemas/movies')
const { error } = require('node:console') 
const { measureMemory } = require('node:vm') 


const app = express()
app.use(express.json())
app.disable('x-powered-by')


/*

app.use(cors({
    origin: (origin, callback) => {
    const ACCEPTED_ORIGINS = [
        'http://localhost:8080',
        'http://localhost:1234',
        'http://movies.com',
        'http://midu.dev'
    ]
    
    if(ACCEPTED_ORIGINS.includes(origin)) {
        return callback(null, true)
    }

    if(!origin) {
        return callback(null, true)
    }

    return callback(new Error('Not allowed by CORS'))
    }
}))

*/

// los origenes aceptados para evitar el error de CORS
const ACCEPTED_ORIGINS = [
    'http://localhost:8080',
    'http://localhost:1234',
    'http://movies.com',
    'http://midu.dev'
]

app.get('/movies', (req, res) => {
    
    const origin = req.header('origin')
    if (ACCEPTED_ORIGINS.includes(origin) || !origin){
        res.header( 'Access-Control-Allow-Origin', origin )
    }

    const { genre } = req.query 
    if (genre){
        const filteredMovies = movies.filter(
            (movies) => movies.genre.some(g => g.toLocaleLowerCase() === genre.toLocaleLowerCase())
        )
        return res.json(filteredMovies)
    }
    res.json(movies)
})

app.get('/movies/:id', (req, res) => {
    const { id } = req.params
    const movie = movies.find((peliBuscada) => peliBuscada.id === id) 
    if (movie) return res.json(movie)
    res.status(404).json({message: 'Movie not found'})
})


app.post('/movies', (req, res) => {
    
    const result = validateMovie(req.body) 


    if (result.error){
        return res.status(404).json({ error: JSON.parse( result.error.message ) })
    }
    
    const newMovie = {
        id: crypto.randomUUID(),
       ...result.data
    }

    movies.push(newMovie)

    res.status(201).json(newMovie)
})

app.delete('/movies/:id', (req, res) => {
    const origin = req.header('origin')
    if (ACCEPTED_ORIGINS.includes(origin) || !origin){
        res.header( 'Access-Control-Allow-Origin', origin )
    }

    const { id } = req.params
    const movieIndex = movies.findIndex( (movie) => movie.id === id)
    

    if (movieIndex === -1){
        return res.status(404).json({ message: 'Movie not found'})
    }

    movies.splice(movieIndex, 1)

    return res.json({ message: 'Movie deleted'})
})


app.patch('/movies/:id', (req, res) => {
    const result = validateParcialMovie(req.body)
    
    if(!result.success) {
        return res.status(404).json({ error: JSON.parse(result.error.message)})
    } 
    
    const { id } = req.params
    const movieIndex = movies.findIndex((peliBuscada) => peliBuscada.id === id)

    if (movieIndex === -1) {
        return res.status(404).json({ message: 'Movie not found' })  
    }
    
    const updateMovie = {
        ...movies[movieIndex],
        ...result.data 
    }
    
    movies[movieIndex] = updateMovie // guardamos la pelicula modificada

    return res.json(updateMovie)
})

app.options('/movies/:id', (req, res) => {
    const origin = req.header('origin')
    if (ACCEPTED_ORIGINS.includes(origin) || !origin){
        res.header( 'Access-Control-Allow-Origin', origin )
        res.header( 'Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE') // los métodos que permito
    }
    res.send(200)
})

const PORT = process.env.PORT ?? 1234

app.listen(PORT, () => {
    console.log(`server listening on port http://localhost:${PORT}`)
})


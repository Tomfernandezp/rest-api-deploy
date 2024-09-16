const z = require('zod')

// utilizo Zod para validar los datos
const movieSchema = z.object({ 
    title: z.string({ // en este caso le digo que el titulo de la película debe ser un string, porque puede que me pasen un número
        invalid_type_error: 'Movie title must be a string', // esto es para personalizar el error
        required_error: 'Movie title is require' // esto es para que el campo "title" sea obligatorio
    }),
    
    // puedo hacer una validación en cadena
    year: z.number().int().positive().min(1900).max(2024), // number() para que sea un número, int() para que sea entero, positive() para que sea positivo, min() y max() para darle un rango

    director: z.string(),
    duration: z.number().int().positive(),
    rate: z.number().min(0).max(10).default(5), // sin int() porque puede ser, por ejemplo: 8.5 ; default() es que si no se le pasa un valor, se le agrega un 5

    poster: z.string().url({ // permite validar si es una url
        message: 'Poster must be a valid URL'
    }),

    
    genre: z.array( // permite validar si es un array
        z.enum(['Action', 'Adventure', 'Comedy', 'Drama', 'Fantasy', 'Horror', 'Thriller', 'Sci-Fi', 'Crime']), // // z.enum() permite validar una serie de string
        {
        required_error: 'Movie genre is require',
        invalid_type_error: 'Movie genre must be an array of enum Genre'
        }
    )
})

function validateMovie(object) { // le paso un objeto para validarlo
    // safeParse() devuelve un objeto result que me dice si hay un error o si hay datos, entonces con un if puedo ver si hay error o no
    return movieSchema.safeParse(object)
    movieSchema.parse(object)
}

function validateParcialMovie(object) {
    // partial() lo que hace es que, cada una de las propiedades descriptas en movieSchema(title, year, etc) las hace opcionales
    // es decir, si no están, no pasa nada; pero si está, la valida
    return movieSchema.partial().safeParse(object)
}

module.exports = {
    validateMovie,
    validateParcialMovie
}
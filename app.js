const express = require('express')
const sqlite3 = require('sqlite3')
const {open} = require('sqlite')
const path = require('path')

const app = express()
app.use(express.json())

const dbPath = path.join(__dirname, 'moviesData.db')
let db = null

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })

    app.listen(3000, () => {
      console.log('Server is running at http://localhost:3000/')
    })
  } catch (e) {
    console.log(`DB Error : ${e.message}`)
  }
}
initializeDBAndServer()

const convertCaseToCamelCase = dbMovie => {
  return {
    movieName: dbMovie.movie_name,
  }
}

//Returns list of movies API

app.get('/movies/', async (request, response) => {
  const getMoviesListQuery = `
    SELECT movie_name FROM movie;
    `
  let moviesList = await db.all(getMoviesListQuery)
  let camelCaseMoviesList = moviesList.map(eachMovie => {
    return convertCaseToCamelCase(eachMovie)
  })
  response.send(camelCaseMoviesList)
})

//CREATE MOVIE

app.post('/movies/', async (request, response) => {
  const movieDetails = request.body
  const {directorId, movieName, leadActor} = movieDetails
  console.log(movieDetails)
  const createMovieQuery = `
     INSERT INTO movie
    (director_id,movie_name,lead_actor)
     VALUES('${directorId}','${movieName}','${leadActor}');
`
  await db.run(createMovieQuery)
  response.send('Movie Successfully Added')
})

const movieconvertCaseToCamelCase = dbMovie => {
  return {
    movieId: dbMovie.movie_id,
    directorId: dbMovie.director_id,
    movieName: dbMovie.movie_name,
    leadActor: dbMovie.lead_actor,
  }
}

//Returns a movie based on the movie ID

app.get('/movies/:movieId/', async (request, response) => {
  const {movieId} = request.params
  const getmovieQuery = `
  SELECT * FROM movie WHERE movie_id=${movieId};
  `
  const movie = await db.get(getmovieQuery)
  response.send(movieconvertCaseToCamelCase(movie))
})

//Update Movie Details

app.put('/movies/:movieId', async (request, response) => {
  const {movieId} = request.params
  const movieDetails = request.body
  const {directorId, movieName, leadActor} = movieDetails
  const putSQLQuery = `
  UPDATE movie
  SET director_id='${directorId}',movie_name='${movieName}',lead_actor='${leadActor}'
  WHERE movie_id=${movieId};
  `
  db.run(putSQLQuery)
  response.send('Movie Details Updated')
})

//DELETE MOVIE API

app.delete('movies/:movieId', async (request, response) => {
  const {movieId} = request.params
  const getSqlQuery = `
  DELETE FROM movie WHERE movie_id=${movieId};
  `
  await db.run(getSqlQuery)
  response.send('Movie Removed')
})

const directorconvertCaseToCamelCase = dbMovie => {
  return {
    directorId: dbMovie.director_id,
    directorName: dbMovie.director_name,
  }
}

// GET Directores API

app.get('/directors/', async (request, response) => {
  const getDirectorsQuery = `
  SELECT * FROM director;
  `
  const getDirectorsArray = await db.all(getDirectorsQuery)
  const camelCaseDirectorsArray = getDirectorsArray.map(eachArray => {
    return directorconvertCaseToCamelCase(eachArray)
  })

  response.send(camelCaseDirectorsArray)
})

const caseConversiondirectorMovieNames = dbMovie => {
  return {
    movieName: dbMovie.movie_name,
  }
}

//Returns a list of all movie names directed by a specific director

app.get('/directors/:directorId/movies', async (request, response) => {
  const {directorId} = request.params
  const getSQLQuery = `
SELECT movie_name FROM movie where director_id=${directorId};
`
  const directorMovieNames = await db.all(getSQLQuery)
  const camelCasedirectorMovieNames = directorMovieNames.map(eachArray => {
    return caseConversiondirectorMovieNames(eachArray)
  })
  response.send(camelCasedirectorMovieNames)
})

module.exports = app

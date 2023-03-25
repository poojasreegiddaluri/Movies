const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const app = express();
const dbPath = path.join(__dirname, "moviesData.db");
let database = null;
app.use(express.json());

const initializeDbAndServer = async () => {
  try {
    database = await open({ filename: dbPath, driver: sqlite3.Database });
  } catch (error) {
    console.log(`Database error is ${error}`);
    process.exit(1);
  }
};
initializeDbAndServer();
//API-1
const convertDbObject = (objectItem) => {
  return {
    movieName: objectItem.movie_name,
  };
};

app.get("/movies/", async (request, response) => {
  const moviesList = `SELECT movie_name FROM movie;`;
  const moviesArray = await database.all(moviesList);
  response.send(moviesArray.map((eachMv) => convertDbObject(eachMv)));
});
//API-2
app.post("/movies/", async (request, response) => {
  const { directorId, movieName, leadActor } = request.body;
  const movieDetails = `INSERT INTO movie (director_id,movie_name,lead_actor)
        VALUES(${directorId}, '${movieName}', '${leadActor}');`;
  const createMovie = await database.run(movieDetails);
  response.send("Movie Successfully Added");
});
//API-3
const ConvertMovieDbAPI3 = (objectItem) => {
  return {
    movieId: objectItem.movie_id,
    directorId: objectItem.director_id,
    movieName: objectItem.movie_name,
    leadActor: objectItem.lead_actor,
  };
};
app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const getMovieQuery = `select * from movie where movie_id=${movieId};`;
  const movieDetails = await database.get(getMovieQuery);
  response.send(ConvertMovieDbAPI3(movieDetails));
});
//API-4
app.put("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const { directorId, movieName, leadActor } = request.body;
  const updateMovieQuery = `update movie set director_id = ${directorId},
  movie_name = '${movieName}', lead_actor = '${leadActor}' where movie_id = ${movieId};`;
  const updateMovieQueryResponse = await database.run(updateMovieQuery);
  response.send("Movie Details Updated");
});
//API-5
app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const movieQuery = `delete from movie where movie_id=${movieId};`;
  const movieDetails = await database.run(movieQuery);
  response.send("Movie Removed");
});
//API-6
const convertDirectorDbAPI6 = (objectItem) => {
  return {
    directorId: objectItem.director_id,
    directorName: objectItem.director_name,
  };
};
app.get("/directors/", async (request, response) => {
  const directorsList = `select * from director;`;
  const directorArray = await database.all(directorsList);
  response.send(
    directorArray.map((eachDirector) => convertDirectorDbAPI6(eachDirector))
  );
});
//API-7
app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const moviesQuery = `select movie_name as movieName from movie where director_id=${directorId};`;
  const movieDetails = await database.all(moviesQuery);
  response.send(movieDetails);
});
module.exports = app;

const express = require("express");
const router = express.Router();
const pool = require("../config.js");
const { authorization } = require("../middlewares/auth");

router.get("/movies", (req, res, next) => {
  console.log(req.loggedUser);
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;

  pool.query(
    `SELECT * FROM movies LIMIT $1 OFFSET $2`,
    [limit, offset],
    (error, result) => {
      if (error) throw error;
      res.status(200).json(result.rows);
    }
  );
});

router.get("/movies/:id", (req, res, next) => {
  const { id } = req.params;
  const getMoviesById = `SELECT * FROM movies WHERE movies.id = $1`;

  pool.query(getMoviesById, [id], (err, result) => {
    if (err) next(err);
    if (result.rows.length === 0) {
      //not found
      next({ name: "ErrorNotFound" });
    } else {
      //found
      res.status(200).json(result.rows[0]);
    }
  });
});

router.post("/movies", authorization, (req, res, next) => {
  const { id, title, genres, year } = req.body;

  const checkMovieExists = `SELECT * FROM movies WHERE id = $1`;

  const createMovie = `
        INSERT INTO movies (id, title, genres, year)
            VALUES
                ($1, $2, $3, $4)
        `;

  pool.query(checkMovieExists, [id], (req, result) => {
    if (result.rows.length) {
      //check Movie exists
      res.send("Movie already exists");
    } else {
      // add Movie
      pool.query(createMovie, [id, title, genres, year], (err, result) => {
        if (err) next(err);
        res.status(201).send(`Movie created Successfully `);
      });
    }
  });
});

router.delete("/movies/:id", authorization, (req, res, next) => {
  const { id } = req.params;
  const checkMovieExists = `SELECT * FROM movies WHERE id = $1`;
  const removeMovies = `DELETE FROM movies WHERE id = $1`;

  pool.query(checkMovieExists, [id], (req, result) => {
    if (!result.rows.length) {
      res.status(404).send(`Movie with id: ${id} not exists, could'nt remove.`);
    } else {
      pool.query(removeMovies, [id], (req, result) => {
        res.status(200).send(`movie with id: ${id} deleted Successfully.`);
      });
    }
  });
});

router.put("/movies/:id", authorization, (req, res, next) => {
  const { id } = req.params;
  const { title } = req.body;

  const checkMovieExists = `SELECT * FROM movies WHERE id = $1`;
  const updateMovie = `UPDATE movies SET title = $1 WHERE id = $2`;

  pool.query(checkMovieExists, [id], (req, result) => {
    if (!result.rows.length) {
      res
        .status(404)
        .send(`Movie with id: ${id} does'nt exists, could'nt update.`);
    } else {
      pool.query(updateMovie, [title, id], (err, result) => {
        if (err) next(err);
        res.status(200).send("Movie Updated Successfully");
      });
    }
  });
});

module.exports = router;

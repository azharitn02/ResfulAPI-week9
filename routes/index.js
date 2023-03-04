const express = require("express");
const router = express.Router();
const moviesRouter = require("./movies");
const usersRouter = require("./users");
const pool = require("../config");
const { authentication } = require("../middlewares/auth");

router.use("/", usersRouter);
// router.use(authentication);
router.use("/", moviesRouter);

// router.get("/users", (req, res, next) => {
//   const getUsers = `SELECT * FROM users ORDER BY users.id`;

//   pool.query(getUsers, (err, result, next) => {
//     if (err) next(err);

//     res.status(200).json(result.rows);
//   });
// });

module.exports = router;

const express = require("express");
const router = express.Router();
const pool = require("../config.js");
require("dotenv").config();
const secretJWT = "rahasia dong";
const bcrypt = require("bcrypt");
const salt = bcrypt.genSaltSync(10);
const { authorization, authentication } = require("../middlewares/auth");

const jwt = require("jsonwebtoken");

router.post("/register", (req, res, next) => {
  const { id, email, gender, password, role } = req.body;
  const hash = bcrypt.hashSync(password, salt);

  const checkEmailExist = `SELECT * FROM users WHERE email = $1`;
  const insertUsersQuery = `INSERT INTO users (id, email, gender, password, role) VALUES ($1, $2, $3, $4, $5)`;

  pool.query(checkEmailExist, [email], (err, result) => {
    if (result.rows.length > 0) {
      res.status(200).json({ message: "Email already Exists" });
    } else {
      pool.query(
        insertUsersQuery,
        [id, email, gender, hash, role],
        (err, result) => {
          res.status(201).json({ message: "User Registered" });
        }
      );
    }
  });
});

// router.post("/register", async (req, res, next) => {
//   const user = req.body; // Extract the user object from the request body
//   if (!user.email || !user.password) {
//     return res.status(400).send("Username and password are required.");
//   }

//   // Hash the password
//   const salt = await bcrypt.genSalt(10);
//   const hashedPassword = await bcrypt.hash(user.password, salt);
//   const lowerCaseEmail = user.email.toLowerCase();

//   // Save the user to the database
//   try {
//     // Check if email already exists in the database
//     const checkEmailExist = `SELECT * FROM users WHERE email = $1`;
//     const emailExists = await pool.query(checkEmailExist, [lowerCaseEmail]);
//     if (emailExists.rows.length > 0) {
//       return res.status(400).json({ error: "Email already exists" });
//     }

//     const insertUsersQuery = `INSERT INTO users (id, email, gender, password, role) VALUES ($1, $2, $3, $4, $5)`;
//     const result = await pool.query(insertUsersQuery, [
//       user.id,
//       lowerCaseEmail,
//       user.gender,
//       hashedPassword,
//       user.role,
//     ]);
//     const savedUser = result.rows[0];

//     // Generate a JWT token
//     // const token = jwt.sign({ savedUser }, "rahasiasekalinih", {
//     //   expiresIn: "1h",
//     // });
//     // Send a response with the token and user data
//     res.status(201).json({ user: { ...savedUser, password: hashedPassword } });
//   } catch (error) {
//     console.error(error);
//     res.status(500).send("Server error");
//   }
// });

router.post("/login", (req, res, next) => {
  const { email, password } = req.body;

  const findUser = ` SELECT * FROM users where email = $1`;
  // Check if the user exists in the database
  pool.query(findUser, [email], (err, result) => {
    const user = result.rows[0];
    if (!result.rows[0]) {
      res.status(200).json({ message: "Wrong Email" });
    } else {
      //compare
      // Check if the password is correct
      const isMatch = bcrypt.compareSync(password, user.password);
      if (isMatch) {
        // Generate a JWT token
        const token = jwt.sign({ id: user.id, email: user.email }, secretJWT, {
          expiresIn: "1h",
        });

        // Send a response with the token and user data
        res.status(200).json({ id: user.id, email: user.email, token });
      } else {
        // return res.status(200).json({ message: "Wrong Password" });
        next({ name: "WrongPassword" });
      }
    }
  });

  // const { email, password } = req.body;

  // const findUser = ` SELECT * FROM users where email = $1`;

  // pool.query(findUser, [email], (err, result) => {
  //   if (err) next(err);
  //   if (!result.rows.length) {
  //     //not found
  //     next({ name: "ErrorNotFound" });
  //   } else {
  //     //found
  //     const result = pool.query(findUser, [email]);
  //     const user = result.rows[0];
  //     const compareSync = bcrypt.compareSync(password, user);
  //     // res.status(200).json({ message: "logged" });
  //     console.log(compare);
  //   }
  // });
});

router.use(authentication);

router.get("/users", authorization, (req, res, next) => {
  //
  // console.log(req.loggedUser); undefine
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;

  pool.query(
    `SELECT * FROM users LIMIT $1 OFFSET $2`,
    [limit, offset],
    (error, result) => {
      if (error) throw error;
      res.status(200).json(result.rows);
    }
  );
});

module.exports = router;

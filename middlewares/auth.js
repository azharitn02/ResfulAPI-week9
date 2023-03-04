const jwt = require("jsonwebtoken");
const secretJWT = "rahasia dong";
const pool = require("../config");

function authentication(req, res, next) {
  const { access_token } = req.headers;
  if (access_token) {
    //success login

    try {
      const decoded = jwt.verify(access_token, secretJWT);
      const { id, email } = decoded;
      const findUser = ` SELECT * FROM users WHERE id = $1`;

      pool.query(findUser, [id], (err, result) => {
        if (err) next(err);
        if (result.rows.length === 0) {
          //not found
          next({ name: "ErrorNotFound" });
        } else {
          //found=>Authenticated
          const user = result.rows[0];

          req.loggedUser = {
            id: user.id,
            email: user.email,
            role: user.role,
          };
          next();
        }
      });
    } catch (error) {
      next({ name: "JWTError" });
    }
  } else {
    //failed
    next({ name: "Unauthenticated" });
  }
}

function authorization(req, res, next) {
  //s
  console.log(req.loggedUser);

  const { role, email, id } = req.loggedUser;
  if (role == "Student") {
    //auuthorize
    next();
  } else {
    //unauthorize
    next({ name: "Unauthorized" });
  }
}

module.exports = {
  authentication,
  authorization,
};

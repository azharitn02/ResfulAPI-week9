function errorHandler(err, req, res, next) {
  if (err.name === "ErrorNotFound") {
    res.status(404).json({ message: "Error Not Found" });
  } else if (err.name === "WrongPassword") {
    res.status(400).json({ message: "Wrong Password or Username" });
  } else if (err.name === "Unauthenticated") {
    res.status(400).json({ message: "Unauthenticated" });
  } else if (err.name === "JWTError") {
    res.status(400).json({ message: "Invalid Token" });
  } else if (err.name === "Unauthorized") {
    res.status(401).json({ message: "Unauthorized" });
  } else {
    res.status(500).json({ message: "Internal Server Error" });
  }
  console.log(err);
}

module.exports = errorHandler;

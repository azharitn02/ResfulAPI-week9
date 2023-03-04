const express = require("express");
const app = express();
const port = 3000;
const router = require("./routes/index");
const errorHandler = require("./middlewares/errorhandler");
const { urlencoded } = require("express");
const swaggerUi = require("swagger-ui-express");
const movieJson = require("./movies.json");
const morgan = require("morgan");

app.use(morgan("tiny"));
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(movieJson));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(router);
//next
app.use(errorHandler);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

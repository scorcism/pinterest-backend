const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const connectMongoose = require("./config/dbConn");
const logger = require("./config/logger");
const requestIp = require("request-ip");
const { rateLimit } = require("express-rate-limit");

dotenv.config();

const PORT = process.env.PORT || 3000;

const initapp = async () => {
  const app = express();

  // Middlewares
  app.use(cors());
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(bodyParser.json());
  app.use(requestIp.mw());

  app.get("/", (req, res) => {
    res.send("Hello World, Im! backend");
  });

  const limiter = rateLimit({
    windowMs: 1 * 60 * 1000,
    limit: 10,
    standardHeaders: "draft-7",
    legacyHeaders: false,
  });

  app.use(limiter);

  if (!process.env.DB_CONNECTION_STRING) {
    console.error("DB_CONNECTION_STRING is not set. Exiting...");
    process.exit(1);
  }

  connectMongoose();

  app.use("/api", require("./api/routes/index"));

  app.use((err, req, res, next) => {
    let httpCode = err.httpCode || 500;
    let errorCode = err.errorCode || "INTERNAL_SERVER_ERROR";
    let errorMessage = err.message || "Internal Server Error";

    res.status(httpCode).json({
      http_code: httpCode,
      message: errorMessage,
      error_code: errorCode,
      data: {},
      error: err,
    });
  });

  app.listen(PORT, () => {
    logger.log({
      level: "http",
      message: `Example app listening on port ${PORT}`,
    });
    console.log(`Example app listening on port ${PORT}`);
  });
};

initapp();

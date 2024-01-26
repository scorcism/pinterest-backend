const express = require("express");
const helmet = require("helmet");
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
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(cors());
  app.use(bodyParser.json());
  app.use(helmet());
  app.use(requestIp.mw());

  app.get("/", (req, res) => {
    res.send("Hello World, Im backend!");
  });

  const limiter = rateLimit({
    windowMs: 1 * 60 * 1000,
    limit: 10,
    standardHeaders: "draft-7",
    legacyHeaders: false,
  });
  // TODO: 
  // app.use(limiter);

  connectMongoose();

  app.use("/api", require("./api/routes/index"));

  app.listen(PORT, () => {
    logger.log({
      level: "http",
      message: `Example app listening on port ${PORT}`,
    });
    console.log(`Example app listening on port ${PORT}`);
  });
};

initapp();

const mongoose = require("mongoose");
const logger = require("./logger");

const connectMongoose = () => {
  mongoose
    .connect(process.env.DB_CONNECTION_STRING)
    .then(() => {
      logger.info(`Connected to DB`);
      console.log("Connected to DB");
    })
    .catch((error) => {
      logger.error(`Error connecting to DB ${JSON.stringify(error)}`);
      console.log("Db Connetion error: ", error);
    });
};

module.exports = connectMongoose;

const mongoose = require("mongoose");

const connectMongoose = () => {
  mongoose
    .connect(process.env.DB_CONNECTION_STRING)
    .then(() => {
      console.log("Connected to DB");
    })
    .catch((error) => {
      console.log("Db Connetion error: ", error);
    });
};

module.exports = connectMongoose
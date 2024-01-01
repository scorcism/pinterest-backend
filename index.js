const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
dotenv.config();

const PORT = process.env.PORT || 3000;

const app = express();

// Middlewares
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());
app.use(helmet());

app.get("/", (req, res) => {
  res.send("Hello World, Im backend!");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});

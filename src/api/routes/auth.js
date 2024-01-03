const express = require("express");
const { register } = require("../controllers/auth.controller");
const {
  registerValidation,
} = require("../../helpers/validations/auth.validation");

const router = express.Router();

router.get("/health", (req, res) => {
  res.send("Auth health working");
});

router.post("/register", registerValidation, register);

module.exports = router;

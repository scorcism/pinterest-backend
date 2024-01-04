const express = require("express");
const { register, verifyAccount } = require("../controllers/auth.controller");
const {
  registerValidation,
} = require("../../helpers/validations/auth.validation");

const router = express.Router();

router.get("/health", (req, res) => {
  res.send("Auth health working");
});

router.post("/register", registerValidation, register);
router.post("/verify-account/:id", verifyAccount);

module.exports = router;

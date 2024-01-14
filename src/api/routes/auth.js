const express = require("express");
const {
  register,
  verifyAccount,
  login,
  forgotPassword,
  resetPassword,
  resendVerificationMail,
} = require("../controllers/auth.controller");
const {
  registerValidation,
} = require("../../helpers/validations/auth.validation");

const router = express.Router();

router.get("/health", (req, res) => {
  res.send("Auth health working");
});

router.post("/register", registerValidation, register);
router.post("/verify-account/:id", verifyAccount);
router.post("/resend-verification-mail/", resendVerificationMail);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:id/:token", resetPassword);

module.exports = router;

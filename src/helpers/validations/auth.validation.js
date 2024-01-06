const { check } = require("express-validator");

const registerValidation = [
  check("email", "").isEmail(),
  check("name", "Enter username").isLength({ min: 1 }),
  check("password", "Password should be at least 6 char long").isLength({
    min: 6,
  }),
];

const loginValidation = [
  check("email", "").isEmail(),
  check("password", "Password should be at least 6 char long").isLength({
    min: 6,
  }),
];

const forgotPasswordValidaion = [check("email", "").isEmail()];

const resetPasswordValidation = [
  check("password", "Password should be at least 6 char long").isLength({
    min: 6,
  }),
  check("cpassword", "Password should be at least 6 char long").isLength({
    min: 6,
  }),
];

module.exports = {
  registerValidation,
  loginValidation,
  forgotPasswordValidaion,
  resetPasswordValidation,
};

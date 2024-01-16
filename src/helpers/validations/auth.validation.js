const { check } = require("express-validator");

const registerValidation = [
  check("name", "Enter username").isLength({ min: 1 }),
  check("email", "").isEmail(),
  check("password", "Password should be at least 6 char long").isLength({
    min: 6,
  }),
  check("username", "Enter valida username").isLength({
    min: 6,
  }),
];

const loginValidation = [
  check("email", "").isEmail(),
  check("password", "Password sh  ould be at least 6 char long").isLength({
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

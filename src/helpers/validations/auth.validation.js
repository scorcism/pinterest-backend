const { check } = require("express-validator");

const registerValidation = [
  check("username", "Username should be at least 6 char long").isLength({
    min: 6,
  }),
  check("email", "").isEmail(),
  check("name", "Enter username").isLength({ min: 1 }),
  check("password", "Password should be at least 6 char long").isLength({
    min: 6,
  }),
];

module.exports = {
  registerValidation,
};

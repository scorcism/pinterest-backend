const { check } = require("express-validator");

const updateUserMetaValidation = [
  check("firstname", "Enter valid firstname").isLength({ min: 1 }),
  check("lastname", "Enter valid last name").isLength({ min: 1 }),
  check("about", "Enter valid about").isLength({ min: 1, max: 250 }),
  check("website", "Enter username").isString(),
  check("pronounce", "Enter username").isString(),
  check("gender", "Enter username").isString(),
];

module.exports = {
  updateUserMetaValidation,
};

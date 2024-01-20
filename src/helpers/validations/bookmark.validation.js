const { check } = require("express-validator");

const addBookmarkValidation = [
  check("postId", "Enter Valid post Id").isLength({ min: 7 }),
];

module.exports = {
    addBookmarkValidation,
};

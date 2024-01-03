const httpStatus = require("http-status");
const {
  ERROR_RESPONSE,
  ERROR_MESSAGE,
  SUCCESS_RESPONSE,
  SUCCESS_MESSAGE,
} = require("../../config/constats");
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const { validationResult } = require("express-validator");

const register = async (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(httpStatus.INTERNAL_SERVER_ERROR).json(
      ERROR_RESPONSE(httpStatus.INTERNAL_SERVER_ERROR, 1002, {
        error: errors,
      })
    );
  }

  try {
    const { email, password, username } = req.body;

    // check if email or username exists or not
    let checkUserAccount = await User.find({
      $or: [{ username: username }, { email: email }],
    });

    if (checkUserAccount.length > 0) {
      return res.status(httpStatus.INTERNAL_SERVER_ERROR).json(
        ERROR_RESPONSE(httpStatus.INTERNAL_SERVER_ERROR, 1002, {
          error: ERROR_MESSAGE[1002],
        })
      );
    }

    const salt = await bcrypt.genSaltSync(10);
    const secPassword = await bcrypt.hashSync(password, salt);

    let crateAccount = await User.create({
      email: email,
      username: username,
      password: secPassword,
    });

    // Send mail

    
    res
      .status(httpStatus.CREATED)
      .json(
        SUCCESS_RESPONSE(httpStatus.CREATED, 2001, {
          data: SUCCESS_MESSAGE[2001],
        })
      );
  } catch (error) {
    console.log("regsiter error: ", error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json(ERROR_RESPONSE(httpStatus.INTERNAL_SERVER_ERROR, 1001));
  }
};

module.exports = {
  register,
};

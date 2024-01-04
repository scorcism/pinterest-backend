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
const { verificationMail } = require("../../helpers/mails/mailTemplate");

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

    let createAccount = await User.create({
      email: email,
      username: username,
      password: secPassword,
    });

    console.log("created account: ", createAccount);
    // Send mail
    if (createAccount) {
      let link = `${process.env.FRONTEND_URL}/verify-acount/${createAccount._id}`;
      await verificationMail(email, link);
    }

    res.status(httpStatus.CREATED).json(
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

const verifyAccount = async (req, res) => {
  try {
    // Base url eg localhost:8080/:id -> localhost:8080/kashjagsajst6
    const { id } = req.params;

    let checkUserAccount = await User.findById(id);

    // Account doesnt exists
    if (!checkUserAccount) {
      return res
        .status(httpStatus.NOT_FOUND)
        .json(ERROR_RESPONSE(httpStatus.NOT_FOUND, 1004));
    }

    if(checkUserAccount.isVerified == 1){
      return res.status(httpStatus.OK).json(
        SUCCESS_RESPONSE(httpStatus.OK, 2003, {
          data: SUCCESS_MESSAGE[2003],
        })
      );
    }

    // Account exits
    let verifyUser = await User.updateOne(
      { _id: id },
      {
        $set: {
          isVerified: 1,
        },
      }
    );

    // If account verification is done
    res.status(httpStatus.OK).json(
      SUCCESS_RESPONSE(httpStatus.OK, 2002, {
        data: SUCCESS_MESSAGE[2002],
      })
    );

  } catch (error) {
    console.log("verify account error: ", error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json(ERROR_RESPONSE(httpStatus.INTERNAL_SERVER_ERROR, 1001));
  }
};

module.exports = {
  register,
  verifyAccount,
};

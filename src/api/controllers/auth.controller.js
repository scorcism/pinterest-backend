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
const {
  verificationMail,
  resetPasswordMail,
} = require("../../helpers/mails/mailTemplate");
const jwt = require("jsonwebtoken");

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
    const { email, password } = req.body;

    // check if email  exists or not
    let checkUserAccount = await User.find({
      email: email,
    });

    if (checkUserAccount.length > 0) {
      return res.status(httpStatus.INTERNAL_SERVER_ERROR).json(
        ERROR_RESPONSE(httpStatus.INTERNAL_SERVER_ERROR, 1002, {
          error: ERROR_MESSAGE[1002],
        })
      );
    }

    const salt = bcrypt.genSaltSync(10);
    const secPassword = await bcrypt.hashSync(password, salt);

    let createAccount = await User.create({
      email: email,
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

    if (checkUserAccount.isVerified == 1) {
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

const login = async (req, res) => {
  const { email, password } = req.body;

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res
      .status(httpStatus.NOT_FOUND)
      .json(ERROR_RESPONSE(httpStatus.NOT_FOUND, 1003, { error: errors }));
  }

  try {
    // Account doesnt exists
    const checkAccount = await User.findOne({
      email: email,
    });

    if (!checkAccount) {
      return res
        .status(httpStatus.NOT_FOUND)
        .json(ERROR_RESPONSE(httpStatus.NOT_FOUND, 1004));
    }

    // Account exists, but not verified
    if (checkAccount.isVerified == 0) {
      return res
        .status(httpStatus.NOT_FOUND)
        .json(ERROR_RESPONSE(httpStatus.NOT_FOUND, 1005));
    }

    // Password do no
    let passwordCompare = bcrypt.compareSync(password, checkAccount.password);

    if (!passwordCompare) {
      return res
        .status(httpStatus.NOT_FOUND)
        .json(ERROR_RESPONSE(httpStatus.NOT_FOUND, 1004));
    }

    // Success, then craft jwt token
    let tokenData = {
      id: checkAccount._id,
    };

    // craft token
    let authToken = jwt.sign(tokenData, process.env.JWT_SECRET);

    res.status(httpStatus.OK).json(
      SUCCESS_RESPONSE(httpStatus.OK, 2004, {
        token: authToken,
        email: checkAccount.email,
      })
    );
  } catch (error) {
    console.log("login error: ", error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json(ERROR_RESPONSE(httpStatus.INTERNAL_SERVER_ERROR, 1001));
  }
};

const forgotPassword = async (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res
      .status(httpStatus.NOT_FOUND)
      .json(ERROR_RESPONSE(httpStatus.NOT_FOUND, 1003, { error: errors }));
  }

  const { email } = req.body;

  try {
    // Find user with the email
    let user = await User.findOne({ email });

    if (!user) {
      return res
        .status(httpStatus.NOT_FOUND)
        .json(ERROR_RESPONSE(httpStatus.NOT_FOUND, 1004));
    }

    // custom secret
    const secret = process.env.JWT_SECRET + user.password;

    const token = jwt.sign({ email: user.email }, secret, {
      expiresIn: `${process.env.FORGOT_PASSWORD_EXP_TIME}h`,
    });

    const link = `${process.env.FRONTEND_URL}/reset-password/${user._id}/${token}`;

    await resetPasswordMail(email, link);

    res.status(httpStatus.OK).json(SUCCESS_RESPONSE(httpStatus.OK, 2005));
  } catch (error) {
    console.log("forgot password error: ", error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json(ERROR_RESPONSE(httpStatus.INTERNAL_SERVER_ERROR, 1001));
  }
};

const resetPassword = async (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res
      .status(httpStatus.NOT_FOUND)
      .json(ERROR_RESPONSE(httpStatus.NOT_FOUND, 1003, { error: errors }));
  }

  try {
    // get password, cpassword from req body
    const { password, cpassword } = req.body;

    if (password !== cpassword) {
      return res
        .status(httpStatus.NOT_FOUND)
        .json(ERROR_RESPONSE(httpStatus.NOT_FOUND, 1006));
    }

    const { id, token } = req.params;

    // Get user data with id
    const user = await User.findById(id);

    const secret = process.env.JWT_SECRET + user.password;

    const verify = jwt.verify(token, secret);

    const { email } = verify;

    if (email != user.email) {
      res
        .status(httpStatus.INTERNAL_SERVER_ERROR)
        .json(ERROR_RESPONSE(httpStatus.INTERNAL_SERVER_ERROR, 1001));
    }

    const salt = await bcrypt.genSalt(10);
    const secPassword = await bcrypt.hash(password, salt);

    await User.updateOne(
      {
        email: email,
      },
      {
        $set: {
          password: secPassword,
        },
      }
    );

    res.status(httpStatus.OK).json(SUCCESS_RESPONSE(httpStatus.OK, 2006));
  } catch (error) {
    console.log("reset password error: ", error);
    res
      .status(httpStatus.NOT_FOUND)
      .json(ERROR_RESPONSE(httpStatus.NOT_FOUND, 1007));
  }
};

module.exports = {
  register,
  verifyAccount,
  login,
  forgotPassword,
  resetPassword,
};

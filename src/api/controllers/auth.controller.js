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
  welcomeMail,
} = require("../../helpers/mails/mailTemplate");
const jwt = require("jsonwebtoken");
const UserMeta = require("../models/UserMeta");
const { OAuth2Client } = require("google-auth-library");
const logger = require("../../config/logger");

const RegisterSource = {
  GOOGLE: 0,
  MEMORIES: 1,
};

const register = async (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(httpStatus.BAD_REQUEST).json(
      ERROR_RESPONSE(httpStatus.BAD_REQUEST, 1002, {
        error: errors,
      })
    );
  }

  try {
    const { email, password, username } = req.body;

    // check if username exists or not
    let checkUsername = await UserMeta.find({ username: username });
    if (checkUsername.length > 0) {
      return res
        .status(httpStatus.INTERNAL_SERVER_ERROR)
        .json(ERROR_RESPONSE(httpStatus.INTERNAL_SERVER_ERROR, 1010));
    }

    // check if email  exists or not
    let checkUserAccount = await User.findOne({
      email: email,
    });

    if (checkUserAccount) {
      return res.status(httpStatus.INTERNAL_SERVER_ERROR).json(
        ERROR_RESPONSE(httpStatus.INTERNAL_SERVER_ERROR, 1002, {
          error: ERROR_MESSAGE[1002],
        })
      );
    }

    const salt = bcrypt.genSaltSync(10);
    const secPassword = await bcrypt.hashSync(password, salt);

    let createAccount = await User.create({
      source: RegisterSource.MEMORIES,
      email: email,
      password: secPassword,
    });

    await UserMeta.create({
      userId: createAccount._id,
      username: username,
    });

    // Send mail
    if (createAccount) {
      let link = `${process.env.FRONTEND_URL}/verify-account/${createAccount._id}`;
      await verificationMail(email, link);
    }

    res.status(httpStatus.CREATED).json(
      SUCCESS_RESPONSE(httpStatus.CREATED, 2001, {
        data: SUCCESS_MESSAGE[2001],
      })
    );
  } catch (error) {
    // console.log("regsiter error: ", error);
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
        .status(httpStatus.BAD_REQUEST)
        .json(ERROR_RESPONSE(httpStatus.BAD_REQUEST, 1004));
    }

    if (checkUserAccount.isVerified == 1) {
      return res.status(httpStatus.OK).json(
        SUCCESS_RESPONSE(httpStatus.OK, 2003, {
          data: SUCCESS_MESSAGE[2003],
        })
      );
    }

    // Account exits
    await User.updateOne(
      { _id: id },
      {
        $set: {
          isVerified: 1,
        },
      }
    );

    // Send Welcome mail
    welcomeMail(checkUserAccount.email);

    // If account verification is done
    res.status(httpStatus.OK).json(
      SUCCESS_RESPONSE(httpStatus.OK, 2002, {
        data: SUCCESS_MESSAGE[2002],
      })
    );
  } catch (error) {
    // console.log("verify account error: ", error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json(ERROR_RESPONSE(httpStatus.INTERNAL_SERVER_ERROR, 1001));
  }
};

const login = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res
      .status(httpStatus.BAD_REQUEST)
      .json(ERROR_RESPONSE(httpStatus.BAD_REQUEST, 1003, { error: errors }));
  }
  const { email, password } = req.body;

  try {
    logger.info(`Login request ${email} :: IP :: ${req.clientIp}`);
    const response = await loginUtil(email, password, RegisterSource.MEMORIES);

    res.status(response.http_code).json({ ...response });
  } catch (error) {
    logger.log({
      level: "error",
      message: `Login error ${JSON.stringify(error)}`,
    });
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json(ERROR_RESPONSE(httpStatus.INTERNAL_SERVER_ERROR, 1001));
  }
};

const loginUtil = async (email, password, source) => {
  try {
    // Account doesnt exists
    const checkAccount = await User.findOne({
      email: email,
    });

    if (!checkAccount) {
      return ERROR_RESPONSE(httpStatus.BAD_REQUEST, 1004);
    }

    // Account exists, but not verified
    if (checkAccount.isVerified == 0) {
      return ERROR_RESPONSE(httpStatus.BAD_REQUEST, 1005);
    }
    if (checkAccount.source != source) {
      return {
        http_code: httpStatus.BAD_REQUEST,
        message: `You have registred with ${
          Math.abs(1 - source) == 0 ? "GOOGLE" : "MEMORIES"
        }, Please login with ${
          Math.abs(1 - source) == 0 ? "GOOGLE" : "MEMORIES"
        }`,
        error_code: 9999,
        data: {},
        error: {},
      };
    }

    // Password do no
    let passwordCompare = bcrypt.compareSync(password, checkAccount.password);

    if (!passwordCompare) {
      return ERROR_RESPONSE(httpStatus.BAD_REQUEST, 1004);
    }

    // Success, then craft jwt token
    let tokenData = {
      id: checkAccount._id,
    };

    // craft token
    let authToken = jwt.sign(tokenData, process.env.JWT_SECRET);

    // Get username of the user
    const userMetaData = await UserMeta.findOne({ userId: checkAccount._id });

    return SUCCESS_RESPONSE(httpStatus.OK, 2004, {
      token: authToken,
      email: checkAccount.email,
      username: userMetaData.username,
    });
  } catch (error) {
    // console.log("login error: ", error);
    logger.log({
      level: "error",
      message: `Login error ${JSON.stringify(error)}`,
    });
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json(ERROR_RESPONSE(httpStatus.INTERNAL_SERVER_ERROR, 1001));
  }
};

const forgotPassword = async (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res
      .status(httpStatus.BAD_REQUEST)
      .json(ERROR_RESPONSE(httpStatus.BAD_REQUEST, 1003, { error: errors }));
  }

  const { email } = req.body;

  try {
    // Find user with the email
    let user = await User.findOne({ email });

    if (!user) {
      return res
        .status(httpStatus.BAD_REQUEST)
        .json(ERROR_RESPONSE(httpStatus.BAD_REQUEST, 1004));
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
    // console.log("forgot password error: ", error);

    logger.log({
      level: "error",
      message: `Forgot Password error ${JSON.stringify(error)}`,
    });
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json(ERROR_RESPONSE(httpStatus.INTERNAL_SERVER_ERROR, 1001));
  }
};

const resetPassword = async (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res
      .status(httpStatus.BAD_REQUEST)
      .json(ERROR_RESPONSE(httpStatus.BAD_REQUEST, 1003, { error: errors }));
  }

  try {
    // get password, cpassword from req body
    const { password, cpassword } = req.body;

    if (password !== cpassword) {
      return res
        .status(httpStatus.BAD_REQUEST)
        .json(ERROR_RESPONSE(httpStatus.BAD_REQUEST, 1006));
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
    // console.log("reset password error: ", error);

    logger.log({
      level: "error",
      message: `Reset Password error ${JSON.stringify(error)}`,
    });
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json(ERROR_RESPONSE(httpStatus.INTERNAL_SERVER_ERROR, 1001));
  }
};

const resendVerificationMail = async (req, res) => {
  const { email } = req.body;
  try {
    let checkUser = await User.findOne({ email });

    if (checkUser == null) {
      return res
        .status(httpStatus.BAD_REQUEST)
        .json(ERROR_RESPONSE(httpStatus.BAD_REQUEST, 1004));
    }

    if (checkUser.isVerified == 1) {
      return res
        .status(httpStatus.BAD_REQUEST)
        .json(ERROR_RESPONSE(httpStatus.BAD_REQUEST, 1009));
    }

    // Send mail
    if (createAccount) {
      let link = `${process.env.FRONTEND_URL}/verify-account/${createAccount._id}`;
      await verificationMail(email, link);
    }

    res.status(httpStatus.CREATED).json(
      SUCCESS_RESPONSE(httpStatus.CREATED, 2001, {
        data: SUCCESS_MESSAGE[2001],
      })
    );
  } catch (error) {
    // console.log("reset password error: ", error);

    logger.log({
      level: "error",
      message: `Resend Verification error ${JSON.stringify(error)}`,
    });
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json(ERROR_RESPONSE(httpStatus.INTERNAL_SERVER_ERROR, 1001));
  }
};

const google = async (req, res) => {
  try {
    const { code } = req.body;
    // console.log("code: ", code);

    const oAuth2Client = new OAuth2Client(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      "postmessage"
    );

    const { tokens } = await oAuth2Client.getToken(code);

    const client = new OAuth2Client();

    const ticket = await client.verifyIdToken({
      idToken: tokens.id_token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = await ticket.getPayload();

    const { email, sub } = payload;

    let checkUserAccount = await User.findOne({
      email: email,
    });

    if (checkUserAccount) {
      // CHeck the source

      // account is created with memories, will send custom message to loggin with google
      if (checkUserAccount.source === RegisterSource.MEMORIES) {
        return res.status(httpStatus.BAD_REQUEST).json(
          ERROR_RESPONSE(httpStatus.BAD_REQUEST, 1015, {
            error: ERROR_MESSAGE[1015],
          })
        );
      } else if (checkUserAccount.source === RegisterSource.GOOGLE) {
        // user is registerd with google, looggin him with google
        const response = await loginUtil(email, sub, RegisterSource.GOOGLE);
        return res.status(response.http_code).json({ ...response });
      }
    }

    const salt = bcrypt.genSaltSync(10);
    const secPassword = await bcrypt.hashSync(sub, salt);

    let createAccount = await User.create({
      source: RegisterSource.GOOGLE,
      email: email,
      password: secPassword,
      isVerified: 1,
    });

    await UserMeta.create({
      userId: createAccount._id,
      username: `${sub}_memories`,
    });

    welcomeMail(email);

    const response = await loginUtil(email, sub);
    res.status(response.http_code).json({ ...response });
  } catch (error) {
    // console.log("Google auth error: ", error);
    logger.log({
      level: "error",
      message: `Google auth ${JSON.stringify(error)}`,
    });
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json(ERROR_RESPONSE(httpStatus.INTERNAL_SERVER_ERROR, 1001));
  }
};

module.exports = {
  register,
  verifyAccount,
  login,
  forgotPassword,
  resetPassword,
  resendVerificationMail,
  google,
};

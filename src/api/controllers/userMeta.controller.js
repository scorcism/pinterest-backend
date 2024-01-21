const { validationResult } = require("express-validator");
const httpStatus = require("http-status");
const { ERROR_RESPONSE, SUCCESS_RESPONSE } = require("../../config/constats");
const UserMeta = require("../models/UserMeta");

const health = async (req, res) => {
  try {
    res.send("User meta API health working");
  } catch (error) {
    // console.log("Error while adding new Post: ", error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json(ERROR_RESPONSE(httpStatus.INTERNAL_SERVER_ERROR, 1001));
  }
};

const getUserMetaData = async (req, res) => {
  try {
    const userId = req.user;

    const userMetaData = await UserMeta.findOne({ userId: userId }).select(
      "-userId -updatedAt -__v -_id"
    );
    res
      .status(httpStatus.OK)
      .json(SUCCESS_RESPONSE(httpStatus.OK, 2013, { data: userMetaData }));
  } catch (error) {
    // console.log("Error while get user meta data: ", error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json(ERROR_RESPONSE(httpStatus.INTERNAL_SERVER_ERROR, 1001));
  }
};

const updateUserMeta = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res
      .status(httpStatus.BAD_REQUEST)
      .json(ERROR_RESPONSE(httpStatus.BAD_REQUEST, 1003, { errors }));
  }
  const userId = req.user;
  const { firstname, lastname, about, website, pronounce, gender } = req.body;

  try {
    await UserMeta.updateOne(
      { userId: userId },
      {
        $set: { firstname, lastname, about, website, pronounce, gender },
      }
    );
    return res
      .status(httpStatus.OK)
      .json(SUCCESS_RESPONSE(httpStatus.OK, 2012));
  } catch (error) {
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json(ERROR_RESPONSE(httpStatus.INTERNAL_SERVER_ERROR, 1001));
  }
};

const getUserDataWithUsername = async (req, res) => {
  try {
    const { username } = req.query;

    const userData = await UserMeta.findOne({ username }).select(
      "firstname lastname about -_id"
    );
    res
      .status(httpStatus.OK)
      .json(SUCCESS_RESPONSE(httpStatus.OK, 2013, { data: userData }));
  } catch (error) {
    // console.log("Error while getting user data with username: ", error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json(ERROR_RESPONSE(httpStatus.INTERNAL_SERVER_ERROR, 1001));
  }
};

const checkUsername = async (req, res) => {
  try {
    const { username } = req.query;

    if (username.length < 6) {
      return res
        .status(httpStatus.BAD_REQUEST)
        .json(ERROR_RESPONSE(httpStatus.BAD_REQUEST, 1018));
    }

    const checkUser = await UserMeta.findOne({ username });

    if (!checkUser) {
      return res
        .status(httpStatus.OK)
        .json(SUCCESS_RESPONSE(httpStatus.OK, 2017));
    }

    return res
      .status(httpStatus.BAD_REQUEST)
      .json(ERROR_RESPONSE(httpStatus.BAD_REQUEST, 1017));
  } catch (error) {
    // console.log("Error while checking username: ", error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json(ERROR_RESPONSE(httpStatus.INTERNAL_SERVER_ERROR, 1001));
  }
};

const updateUsername = async (req, res) => {
  const userId = req.user;

  const { username } = req.body;

  try {
    await UserMeta.updateOne(
      { userId: userId },
      {
        $set: { username },
      }
    );
    return res
      .status(httpStatus.OK)
      .json(SUCCESS_RESPONSE(httpStatus.OK, 2018));
  } catch (error) {
    // console.log("Error saving username: ", error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json(ERROR_RESPONSE(httpStatus.INTERNAL_SERVER_ERROR, 1001));
  }
};

module.exports = {
  health,
  updateUserMeta,
  getUserMetaData,
  getUserDataWithUsername,
  checkUsername,
  updateUsername,
};

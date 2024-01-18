const { validationResult } = require("express-validator");
const httpStatus = require("http-status");
const { ERROR_RESPONSE, SUCCESS_RESPONSE } = require("../../config/constats");
const UserMeta = require("../models/UserMeta");

const health = async (req, res) => {
  try {
    res.send("User meta API health working");
  } catch (error) {
    console.log("Error while adding new Post: ", error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json(ERROR_RESPONSE(httpStatus.INTERNAL_SERVER_ERROR, 1001));
  }
};

const getUserMetaData = async (req, res) => {
  try {
    const userId = req.user;

    const userMetaData = await UserMeta.findOne({ userId: userId }).select(
      "-userId -updatedAt -__v -_id -username"
    );
    res
      .status(httpStatus.OK)
      .json(SUCCESS_RESPONSE(httpStatus.OK, 2013, { data: userMetaData }));
  } catch (error) {
    console.log("Error while get user meta data: ", error);
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

module.exports = {
  health,
  updateUserMeta,
  getUserMetaData,
};

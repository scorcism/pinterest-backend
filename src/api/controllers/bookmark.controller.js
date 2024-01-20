const httpStatus = require("http-status");
const { ERROR_RESPONSE, SUCCESS_RESPONSE } = require("../../config/constats");
const { validationResult, check } = require("express-validator");
const Bookmark = require("../models/Bookmar");
const UserMeta = require("../models/UserMeta");

const addBookmark = async (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res
      .status(httpStatus.BAD_REQUEST)
      .json(ERROR_RESPONSE(httpStatus.BAD_REQUEST, 1011, { errors }));
  }

  const { postId } = req.body;
  const userId = req.user;

  try {
    // Check if bookmark is already added to the user
    const checkBookmakrOfUser = await Bookmark.findOne({ userId, postId });
    if (checkBookmakrOfUser) {
      return res
        .status(httpStatus.BAD_REQUEST)
        .json(ERROR_RESPONSE(httpStatus.BAD_REQUEST, 1012));
    }

    await Bookmark.create({
      userId,
      postId,
    });

    return res
      .status(httpStatus.OK)
      .json(SUCCESS_RESPONSE(httpStatus.OK, 2015));
  } catch (error) {
    console.log("add Bookmark error: ", error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json(ERROR_RESPONSE(httpStatus.INTERNAL_SERVER_ERROR, 1001));
  }
};

// Will take username from params
const getBookmarks = async (req, res) => {
  try {
    const { username } = req.query;

    // get username from userId
    const user = await UserMeta.findOne({ username });

    if (!user) {
      return res
        .status(httpStatus.BAD_REQUEST)
        .json(ERROR_RESPONSE(httpStatus.BAD_REQUEST, 1013));
    }

    const bookmarks = await Bookmark.find({ userId: user.userId }).populate(
      "postId", 'url title userId postUrl'
    ).select("postId -_id")

    return res
      .status(httpStatus.OK)
      .json(SUCCESS_RESPONSE(httpStatus.OK, 2015, { bookmarks }));
  } catch (error) {
    console.log("Get bookmarks error: ", error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json(ERROR_RESPONSE(httpStatus.INTERNAL_SERVER_ERROR, 1001));
  }
};

module.exports = {
  addBookmark,
  getBookmarks,
};

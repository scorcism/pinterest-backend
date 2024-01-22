const httpStatus = require("http-status");
const { ERROR_RESPONSE, SUCCESS_RESPONSE } = require("../../config/constats");
const GlobalTags = require("../models/GlobalTags");

const createGlobalTags = async (req, res) => {
  const { tag } = req.body;

  try {
    await GlobalTags.create({
      title: tag,
    });

    // console.log("add Global Tag: ", addGlobalTag);

    res.status(httpStatus.OK).json(SUCCESS_RESPONSE(httpStatus.OK, 2009));
  } catch (error) {
    // console.log("Error while getting all tags: ", error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json(ERROR_RESPONSE(httpStatus.INTERNAL_SERVER_ERROR, 1001));
  }
};

const getGlobalTags = async (req, res) => {
  // ?tag=ab
  const query = req.query.tag;

  try {
    let allTags = await GlobalTags.find({
      title: { $regex: query, $options: "i" },
    })
      .limit(10)
      .select("-_id -__v -updatedAt -createdAt");

    if (!allTags) {
      throw new Error("RohanError");
    }

    res
      .status(httpStatus.OK)
      .json(SUCCESS_RESPONSE(httpStatus.OK, 2008, { tags: allTags }));
  } catch (error) {
    // console.log("Error while getting all tags: ", error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json(ERROR_RESPONSE(httpStatus.INTERNAL_SERVER_ERROR, 1001));
  }
};


module.exports = {
  getGlobalTags,
  createGlobalTags,
};

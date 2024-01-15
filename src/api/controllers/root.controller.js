const S3 = require("aws-sdk/clients/s3");
const httpStatus = require("http-status");
const { ERROR_RESPONSE, SUCCESS_RESPONSE } = require("../../config/constats");
const Post = require("../models/Post");
const GlobalTags = require("../models/GlobalTags");

const AWS_BUCKET_NAME = process.env.AWS_BUCKET_NAME;
const AWS_ACCESS_KEY = process.env.AWS_ACCESS_KEY;
const AWS_SECRET_KEY = process.env.AWS_SECRET_KEY;
const AWS_BUCKET_REGION = process.env.AWS_BUCKET_REGION;

const s3 = new S3({
  region: AWS_BUCKET_REGION,
  secretAccessKey: AWS_SECRET_KEY,
  accessKeyId: AWS_ACCESS_KEY,
});

// Upload image to s3 and return the location
const uploadImage = async (title, file) => {
  let key = `${Date.now()}-${title}-${file.originalname}`;

  const s3Params = {
    Bucket: AWS_BUCKET_NAME,
    Key: key,
    Body: file.buffer,
  };

  let res = await s3.upload(s3Params).promise();

  let location = res.Location;
  return location;
};

const addPost = async (title, desc, tags, location, userId) => {
  try {
    let newPost = await Post.create({
      userId,
      url: location,
      title,
      desc,
      tags: JSON.parse(tags),
    });

    console.log("new Post: ", newPost);

    return true;
  } catch (error) {
    console.log("Error while adding new Post: ", error);
    return false;
  }
};

const createGlobalTags = async (req, res) => {
  const { tag } = req.body;

  try {
    let addGlobalTag = await GlobalTags.create({
      title: tag,
    });

    console.log("add Global Tag: ", addGlobalTag);

    res.status(httpStatus.OK).json(SUCCESS_RESPONSE(httpStatus.OK, 2009));
  } catch (error) {
    console.log("Error while getting all tags: ", error);
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
    console.log("Error while getting all tags: ", error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json(ERROR_RESPONSE(httpStatus.INTERNAL_SERVER_ERROR, 1001));
  }
};

const deletePost = async (req, res) => {
  const userId = req.user;
  const postId = req.params.id;
  try {
    const deletePost = await Post.deleteOne({ userId: userId, _id: postId });
    console.log("delete Post: ", deletePost);

    return res
      .status(httpStatus.OK)
      .json(SUCCESS_RESPONSE(httpStatus.OK, 2011));
  } catch (error) {
    console.log("Error while deleting Post: ", error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json(ERROR_RESPONSE(httpStatus.INTERNAL_SERVER_ERROR, 1001));
  }
};

const updatePost = async (req, res) => {
  const userId = req.user;

  const postId = req.params.id;

  const { title, desc } = req.body;

  try {
    const updatePost = await Post.updateOne(
      { userId: userId, _id: postId },
      { $set: { title, desc } }
    );

    console.log("update Post: ", updatePost);

    res.status(httpStatus.OK).json(SUCCESS_RESPONSE(httpStatus.OK, 2010));
  } catch (error) {
    console.log("Error while updating post: ", error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json(ERROR_RESPONSE(httpStatus.INTERNAL_SERVER_ERROR, 1001));
  }
};

module.exports = {
  addPost,
  deletePost,
  updatePost,
  uploadImage,
  getGlobalTags,
  createGlobalTags,
};

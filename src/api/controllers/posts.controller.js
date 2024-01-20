const S3 = require("aws-sdk/clients/s3");
const httpStatus = require("http-status");
const { ERROR_RESPONSE, SUCCESS_RESPONSE } = require("../../config/constats");
const Post = require("../models/Post");
const UserMeta = require("../models/UserMeta");
const User = require("../models/User");

const AWS_BUCKET_NAME = process.env.AWS_BUCKET_NAME;
const AWS_ACCESS_KEY = process.env.AWS_ACCESS_KEY;
const AWS_SECRET_KEY = process.env.AWS_SECRET_KEY;
const AWS_BUCKET_REGION = process.env.AWS_BUCKET_REGION;
const ITEMS_PER_PAGE = 20;

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

const addPost = async (title, desc, postUrl, tags, location, userId) => {
  try {
    let newPost = await Post.create({
      userId,
      url: location,
      title,
      postUrl,
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

const getPosts = async (req, res) => {
  try {
    const { page } = req.query;

    const skip = ITEMS_PER_PAGE * (page - 1);

    const documentCountState = Post.estimatedDocumentCount();
    const postsState = Post.find()
      .limit(ITEMS_PER_PAGE)
      .skip(skip)
      .select("userId title _id postUrl url");

    const [posts, documentCount] = await Promise.all([
      postsState,
      documentCountState,
    ]);

    const pageCount = Math.floor(documentCount / ITEMS_PER_PAGE);

    res
      .status(httpStatus.OK)
      .json(SUCCESS_RESPONSE(httpStatus.OK, 2014, { posts, pageCount, page }));
  } catch (error) {
    console.log("Error while getting posts: ", error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json(ERROR_RESPONSE(httpStatus.INTERNAL_SERVER_ERROR, 1001));
  }
};

// Get user post by username
const getUserPosts = async (req, res) => {
  try {
    const { username } = req.query;

    // get username from userId
    const user = await UserMeta.findOne({ username });

    if (!user) {
      return res
        .status(httpStatus.BAD_REQUEST)
        .json(ERROR_RESPONSE(httpStatus.BAD_REQUEST, 1013));
    }

    const posts = await Post.find({ userId: user.userId }).select(
      "url title userId postUrl"
    );

    return res
      .status(httpStatus.OK)
      .json(SUCCESS_RESPONSE(httpStatus.OK, 2015, { posts }));
  } catch (error) {
    console.log("Get bookmarks error: ", error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json(ERROR_RESPONSE(httpStatus.INTERNAL_SERVER_ERROR, 1001));
  }
};

const getPost = async (req, res) => {
  const postId = req.params.id;
  try {
    const postData = await Post.findOne({ _id: postId }).select(
      "_id url title desc postUrl tags createdAt userId"
    );
    if (!postData) {
    }

    const userData = await UserMeta.findOne({ userId: postData.userId }).select(
      "firstname lastname username"
    );

    const data = {
      postId: postData._id,
      url: postData.url,
      title: postData.title,
      desc: postData.desc,
      postUrl: postData.postUrl,
      tags: postData.tags,
      createdAt: postData.createdAt,
      firstname: userData.firstname,
      username: userData.username,
      lastname: userData.lastname,
    };

    res
      .status(httpStatus.OK)
      .json(SUCCESS_RESPONSE(httpStatus.OK, 2015, { data }));
  } catch (error) {
    console.log("Get Post error: ", error);
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
  getPosts,
  getUserPosts,
  getPost,
};

const express = require("express");
const multer = require("multer");
const {
  uploadImage,
  addPost,
  getGlobalTags,
  createGlobalTags,
} = require("../controllers/root.controller");

const router = express.Router();

router.get("/health", (req, res) => {
  res.send("root health working");
});

const storage = multer.memoryStorage();

const upload = multer({ storage: storage });

router.post("/addPost", upload.single("image"), async (req, res) => {
  const { title, desc } = req.body;
  // Upload image to s3, return the image url
  const location = await uploadImage(title, image);

  // Upload image to the DB
  const response = await addPost(title, desc, tags, location);

  return response;
});

// Add for delete post, edit post

router.get("/getGlobalTags", getGlobalTags);
router.post("/createGlobalTags", createGlobalTags);

module.exports = router;

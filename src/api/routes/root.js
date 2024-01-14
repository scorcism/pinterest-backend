const express = require("express");
const multer = require("multer");
const {
  uploadImage,
  addPost,
  getGlobalTags,
  createGlobalTags,
  deletePost,
  updatePost,
} = require("../controllers/root.controller");
const authMiddleware = require("../middleware/auth.middleware");

const router = express.Router();

router.get("/health", (req, res) => {
  res.send("root health working");
});

const storage = multer.memoryStorage();

const upload = multer({ storage: storage });

router.post(
  "/addPost",
  authMiddleware,
  upload.single("image"),
  async (req, res) => {
    const { title, desc, image, tags } = req.body;

    // Upload image to s3, return the image url

    const location = await uploadImage(title, image);

    // Upload image to the DB
    const response = await addPost(title, desc, tags, location);

    return response;
  }
);

router.post("/updatePost/:id", authMiddleware, updatePost);
router.post("/deletePost/:id", authMiddleware, deletePost);

router.get("/getGlobalTags", getGlobalTags);
router.post("/createGlobalTags", createGlobalTags);

module.exports = router;

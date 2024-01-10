const express = require("express");
const multer = require("multer");
const {
  uploadImage,
  addImage,
  getGlobalTags,
  createGlobalTags,
} = require("../controllers/root.controller");

const router = express.Router();

router.get("/health", (req, res) => {
  res.send("root health working");
});

const storage = multer.memoryStorage();

const upload = multer({ storage: storage });

router.post("/addImage", upload.single("image"), async (req, res) => {
  const { title, desc } = req.body;
  // Upload image to s3, return the image url
  const location = await uploadImage(title, image);

  // Upload image to the DB
  const response = await addImage(title, desc, tags, location);

  return response;
});

router.get("/getGlobalTags", getGlobalTags);
router.post("/createGlobalTags", createGlobalTags);
module.exports = router;

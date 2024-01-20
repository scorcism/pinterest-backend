const express = require("express");
const authMiddleware = require("../../middleware/auth.middleware");
const { addBookmark, getBookmarks } = require("../../controllers/bookmark.controller");

const router = express.Router();

router.get("/health", (req, res) => {
  res.send("add Bookmak health working");
});
router.post("/addBookmark", authMiddleware, addBookmark);
router.get("/getBookmarks", getBookmarks);

module.exports = router;

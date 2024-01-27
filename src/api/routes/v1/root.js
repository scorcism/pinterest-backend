const express = require("express");
const {
  getGlobalTags,
  createGlobalTags,
} = require("../../controllers/root.controller");

const router = express.Router();

router.get("/health", (req, res) => {
  res.send("root health working");
});

router.get("/getGlobalTags", getGlobalTags);
router.post("/createGlobalTags", createGlobalTags);

module.exports = router;

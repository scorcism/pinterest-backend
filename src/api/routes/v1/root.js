const express = require("express");
const {
  getGlobalTags,
  createGlobalTags,
} = require("../../controllers/root.controller");
const authMiddleware = require("../../middleware/auth.middleware");
const httpStatus = require("http-status");
const { SUCCESS_RESPONSE, ERROR_RESPONSE } = require("../../../config/constats");

const router = express.Router();

router.get("/health", (req, res) => {
  res.send("root health working");
});

router.get("/getGlobalTags", getGlobalTags);
router.post("/createGlobalTags", createGlobalTags);

module.exports = router;

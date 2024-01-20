const express = require("express");
const {
  health,
  updateUserMeta,
  getUserMetaData,
} = require("../../controllers/userMeta.controller");
const {
  updateUserMetaValidation,
} = require("../../../helpers/validations/userMeta.validation");
const authMiddleware = require("../../middleware/auth.middleware");
const { getUserDataWithUsername } = require("../../controllers/userMeta.controller");
const router = express.Router();

router.get("/health", health);
router.post(
  "/update-meta",
  updateUserMetaValidation,
  authMiddleware,
  updateUserMeta
);

router.get("/userDataByUsername", getUserDataWithUsername);

router.get("/user-meta-data", authMiddleware, getUserMetaData);
module.exports = router;

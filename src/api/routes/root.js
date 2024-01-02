const express = require("express");

const router = express.Router();

router.get("/health", (req, res) => {
  res.send("root health working");
});

module.exports = router;

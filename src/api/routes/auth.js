const express = require("express");

const router = express.Router();

router.get("/health", (req, res) => {
  res.send("Auth health working");
});

module.exports = router;

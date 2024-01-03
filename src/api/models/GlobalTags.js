const mongoose = require("mongoose");

const globalTagSchema = mongoose.Schema(
  {
    title: {
      type: String,
      require: true,
    },
  },
  { timestamps: true }
);

const GlobalTag = mongoose.model("GlobalTag", globalTagSchema);
module.exports = GlobalTag;

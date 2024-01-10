const mongoose = require("mongoose");

const globalTagsSchema = mongoose.Schema(
  {
    title: {
      type: String,
      require: true,
    },
  },
  { timestamps: true }
);

const GlobalTags = mongoose.model("GlobalTags", globalTagsSchema);
module.exports = GlobalTags;

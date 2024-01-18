const mongoose = require("mongoose");

const userMetaSchema = mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    username: {
      type: String,
      unique: true,
      require: true,
    },
    firstname: {
      type: String,
      require: true,
    },
    lastname: {
      type: String,
      require: true,
    },
    about: {
      type: String,
      require: true,
    },
    webite: {
      type: String,
      require: true,
    },
    pronounce: {
      type: String,
      require: true,
    },
    gender: {
      type: String,
      require: true,
    },
    social: [
      {
        type: String,
      },
    ],
  },
  { timestamps: true }
);

const UserMeta = mongoose.model("UserMeta", userMetaSchema);
module.exports = UserMeta;

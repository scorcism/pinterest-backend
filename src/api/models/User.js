const mongoose = require("mongoose");

const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      retquire: true,
    },
    email: {
      type: String,
      require: true,
    },
    password: {
      type: String,
      require: true,
    },
    isVerified: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);


const User = mongoose.model("User", userSchema);
module.exports = User;

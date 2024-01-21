const httpStatus = require("http-status");
const jwt = require("jsonwebtoken");
const { ERROR_RESPONSE } = require("../../config/constats");

const authMiddleware = (req, res, next) => {
  try {
    const tokenHeader = req.headers.authorization;

    if (!tokenHeader) {
      console.log("Middleware error: ");
      return res
        .status(httpStatus.INTERNAL_SERVER_ERROR)
        .json(ERROR_RESPONSE(httpStatus.INTERNAL_SERVER_ERROR, 1008));
    }

    const token = tokenHeader.split(" ")[1];
    const data = jwt.verify(token, process.env.JWT_SECRET);

    req.user = data.id;

    next();
  } catch (error) {
    console.log("Middleware error: ", error);
    return res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json(ERROR_RESPONSE(httpStatus.INTERNAL_SERVER_ERROR, 1008));
  }
};

module.exports = authMiddleware;

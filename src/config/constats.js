const PI = 3.14257;

const ERROR_MESSAGE = {
  1001: "Internal Server Error",
  1002: "Account already exists with the username or email",
  1003: "Check all the fileds",
  1004: "Invalid Credentials",
  1005: "Please verify your account",
  1006: "Password do not match",
  1007: "Reset password token expired",
};

const SUCCESS_MESSAGE = {
  2001: "Account registration complete, please verify your account",
  2002: "Account Verification complete, please login ",
  2003: "Account already verified, please login ",
  2004: "Login successfull ",
  2005: "Reset Password mail has been sent",
  2006: "Password reset successfull, please login",
  2007: "New Image added",
  2008: "List of Global Tags",
  2009: "Added new Global tag",
};

const ERROR_RESPONSE = (http_code, error_code, error = {}) => {
  return {
    http_code,
    message: ERROR_MESSAGE[error_code],
    error_code,
    data: {},
    error: error,
  };
};

const SUCCESS_RESPONSE = (http_code, success_code, data = {}) => {
  return {
    http_code,
    message: SUCCESS_MESSAGE[success_code],
    success_code,
    data: data,
    error: {},
  };
};

module.exports = {
  PI,
  ERROR_MESSAGE,
  ERROR_RESPONSE,
  SUCCESS_RESPONSE,
  SUCCESS_MESSAGE,
};

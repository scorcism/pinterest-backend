const PI = 3.14257;

const ERROR_MESSAGE = {
  1001: "Internal Server Error",
  1002: "Account already exists with the username or email",
  1003: "Check all the fileds",
  1004: "Invalid Credentials",
};

const SUCCESS_MESSAGE = {
  2001: "Account registration complete, please verify your account",
  2002: "Account Verification complete, please login ",
  2003: "Account already verified, please login ",
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

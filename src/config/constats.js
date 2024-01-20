const PI = 3.14257;

const ERROR_MESSAGE = {
  1001: "Internal Server Error",
  1002: "Account already exists with the email",
  1003: "Check all the fileds",
  1004: "Invalid Credentials",
  1005: "Please verify your account",
  1006: "Password do not match",
  1007: "Reset password token expired",
  1008: "Token expired, please login",
  1009: "Account already verified, Please Login",
  1010: "Choose another username",
  1011: "Enter valid Post id to bookmark",
  1012: "Post already exists in your acccout",
  1013: "Enter valid username",
  1014: "You are registers with google, please try to login with google",
  1015: "Account exists with memories, Login with memories or use forgot password",
  1016: "Account exists with google, Login with google",
};

const SUCCESS_MESSAGE = {
  2001: "Account registration complete, please verify your account",
  2002: "Account Verification complete, please login ",
  2003: "Account already verified, please login ",
  2004: "Login successfull ",
  2005: "Reset Password mail has been sent",
  2006: "Password reset successfull, please login",
  2007: "New Post created",
  2008: "List of Global Tags",
  2009: "Added new Global tag",
  2010: "Post Updated",
  2011: "Post Deleted",
  2012: "User data updated",
  2013: "User Meta Data",
  2014: "All Posts",
  2015: "Bookmark added",
  2015: "Post Data",
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

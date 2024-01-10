const JwtStrategy = require("passport-jwt").Strategy;
const ExtractJwt = require("passport-jwt").ExtractJwt;
const passport = require("passport");

const authMiddleware = (next) => {
  var opts = {};
  opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
  opts.secretOrKey = "secret";

  passport.use(
    new JwtStrategy(opts, function (jwt_payload, done) {
      console.log("decoded payload: ", jwt_payload);
      next();
    })
  );
};

module.exports = authMiddleware;

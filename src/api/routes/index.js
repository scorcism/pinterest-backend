const express = require("express");
const router = express.Router();
const rootRoutes = require("./v1/root");
const authRoutes = require("./v1/auth");
const userMeta = require("./v1/userMeta");
const posts = require("./v1/post");
const bookmark = require("./v1/bookmark");

const routes = [
  {
    path: "/auth",
    routes: authRoutes,
  },
  {
    path: "/root",
    routes: rootRoutes,
  },
  {
    path: "/user-meta",
    routes: userMeta,
  },
  {
    path: "/posts",
    routes: posts,
  },
  {
    path: "/bookmark",
    routes: bookmark,
  },
];

routes.forEach((route) => {
  router.use(route.path, route.routes);
});

module.exports = router;

const express = require("express");
const router = express.Router();
const rootRoutes = require("./root");
const authRoutes = require("./auth");
const userMeta = require("./userMeta")

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
];

routes.forEach((route) => {
  router.use(route.path, route.routes);
});

module.exports = router;

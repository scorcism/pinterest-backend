const { Queue } = require("bullmq");
const REDIS_HOST = String(process.env.REDIS_HOST);
const REDIS_PORT = Number(process.env.REDIS_PORT);
const REDIS_USERNAME = String(process.env.REDIS_USERNAME);
const REDIS_PASSWORD = String(process.env.REDIS_PASSWORD);

const welcomeMailListQueue = new Queue("welcome-mail-list-queue", {
  connection: {
    host: REDIS_HOST,
    port: REDIS_PORT,
    username: REDIS_USERNAME,
    password: REDIS_PASSWORD,
  },
});

const emailVerificationMailQueue = new Queue(
  "emailVerification-mail-list-queue",
  {
    connection: {
      host: REDIS_HOST,
      port: REDIS_PORT,
      username: REDIS_USERNAME,
      password: REDIS_PASSWORD,
    },
  }
);

const resetPasswordMailQueue = new Queue("resetPassword-mail-list-queue", {
  connection: {
    host: REDIS_HOST,
    port: REDIS_PORT,
    username: REDIS_USERNAME,
    password: REDIS_PASSWORD,
  },
});

module.exports = {
  welcomeMailListQueue,
  emailVerificationMailQueue,
  resetPasswordMailQueue,
};

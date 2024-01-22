const winston = require("winston");
const DailyRotateFIle = require("winston-daily-rotate-file");

/**
 * Log Levels
 *{
   error: 0,
   warn: 1,
   info: 2,
   http: 3,
   verbose: 4,
   debug: 5,
   silly: 6
}
 *  */

const enumerateErrorFormat = winston.format((info) => {
  if (info instanceof Error) {
    Object.assign(info, { message: info.stack });
  }
  return info;
});

let winstonTransports = [
  new winston.transports.Console({
    stderrLevels: ["error"],
  }),
];

let winstonFormat = winston.format.combine(
  enumerateErrorFormat(),
  winston.format.splat(),
  winston.format.timestamp({ format: "DD-MMM-YYYY HH:mm:ss" }),
  winston.format.metadata({ fillExcept: ["message", "level", "timestamp"] }),
  winston.format.printf(({ timestamp, level, message, metadata }) => {
    return `${timestamp} ${level}: ${
      typeof message === "string" ? message : JSON.stringify(message)
    } ${Object.keys(metadata).length ? JSON.stringify(metadata) : ""}`;
  })
);

const fileTransportRotation = new DailyRotateFIle({
  filename: "./memories_logs/%DATE%",
  datePattern: "DD-MMM-YYYY",
  zippedArchive: true,
  utc: true,
  extension: ".log",
  maxSize: "10mb",
  maxFiles: "14d",
});

winstonTransports.push(fileTransportRotation);

const logger = winston.createLogger({
  level: String(process.env.LOG_LEVEL) | "error",
  format: winstonFormat,
  transports: winstonTransports,
});

module.exports = logger;

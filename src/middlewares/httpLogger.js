const {pinoHttp} = require("pino-http");
const logger = require("../config/logger");

const httpLogger = pinoHttp({
  logger,

  serializers: {
    req(req) {
      return {
        method: req.method,
        url: req.url,
      };
    },

    res(res) {
      return {
        statusCode: res.statusCode,
      };
    },
  },
});

module.exports = httpLogger;

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorMiddleware = void 0;
const errors_1 = require("../utils/errors");
const logger_1 = require("../utils/logger");
const errorMiddleware = (err, req, res, next) => {
    if (err instanceof errors_1.AppError) {
        return res.status(err.statusCode).json({ message: err.message });
    }
    logger_1.logger.error(err);
    return res.status(500).json({ message: 'Internal Server Error' });
};
exports.errorMiddleware = errorMiddleware;

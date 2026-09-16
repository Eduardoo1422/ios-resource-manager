"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireClient = exports.requireAdmin = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const errors_1 = require("../utils/errors");
const requireAdmin = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader)
        throw new errors_1.AppError('Token não fornecido', 401);
    const token = authHeader.split(' ')[1];
    try {
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || 'secret');
        // @ts-ignore
        req.admin = decoded;
        if (decoded.mustChangePassword && req.path !== '/api/admin/change-password') {
            throw new errors_1.AppError('Senha precisa ser alterada', 403);
        }
        next();
    }
    catch (err) {
        throw new errors_1.AppError('Token inválido', 401);
    }
};
exports.requireAdmin = requireAdmin;
const requireClient = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader)
        throw new errors_1.AppError('Token não fornecido', 401);
    const token = authHeader.split(' ')[1];
    try {
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || 'secret');
        // @ts-ignore
        req.device = decoded;
        next();
    }
    catch (err) {
        throw new errors_1.AppError('Token inválido', 401);
    }
};
exports.requireClient = requireClient;

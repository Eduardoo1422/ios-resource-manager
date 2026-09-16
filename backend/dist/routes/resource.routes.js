"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resourceRoutes = void 0;
const express_1 = require("express");
const ResourceController_1 = require("../controllers/ResourceController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const multer_1 = __importDefault(require("multer"));
const upload = (0, multer_1.default)({
    dest: 'temp/',
    limits: { fileSize: 50 * 1024 * 1024 } // 50MB
});
const resourceRoutes = (0, express_1.Router)();
exports.resourceRoutes = resourceRoutes;
const resourceController = new ResourceController_1.ResourceController();
resourceRoutes.use(authMiddleware_1.requireAdmin);
resourceRoutes.post('/', resourceController.create);
resourceRoutes.post('/:id/upload', upload.single('file'), resourceController.uploadVersion);
resourceRoutes.patch('/:id/status', resourceController.updateStatus);
resourceRoutes.get('/', resourceController.list);
resourceRoutes.patch('/:id/rollback/:versionId', resourceController.rollback);

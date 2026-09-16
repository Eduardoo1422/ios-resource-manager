"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.hashPassword = hashPassword;
exports.comparePassword = comparePassword;
exports.generateLicenseKey = generateLicenseKey;
exports.calculateSHA256 = calculateSHA256;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const crypto_1 = __importDefault(require("crypto"));
async function hashPassword(password) {
    return bcryptjs_1.default.hash(password, 8);
}
async function comparePassword(password, hash) {
    return bcryptjs_1.default.compare(password, hash);
}
function generateLicenseKey() {
    return Array.from({ length: 3 }, () => crypto_1.default.randomBytes(2).toString('hex').toUpperCase()).join('-');
}
function calculateSHA256(filePath) {
    return new Promise((resolve, reject) => {
        const hash = crypto_1.default.createHash('sha256');
        const stream = require('fs').createReadStream(filePath);
        stream.on('data', (data) => hash.update(data));
        stream.on('end', () => resolve(hash.digest('hex')));
        stream.on('error', reject);
    });
}

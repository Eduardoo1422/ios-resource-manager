"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.KeyService = void 0;
const client_1 = require("@prisma/client");
const crypto_1 = require("../utils/crypto");
const prisma = new client_1.PrismaClient();
class KeyService {
    async generateKeys(count, validUntil, maxDevices) {
        const keys = [];
        for (let i = 0; i < count; i++) {
            keys.push({
                keyString: (0, crypto_1.generateLicenseKey)(),
                validUntil,
                maxDevices,
            });
        }
        return prisma.licenseKey.createMany({ data: keys });
    }
    async getAllKeys() {
        return prisma.licenseKey.findMany({ include: { devices: true } });
    }
    async toggleActive(id, isActive) {
        return prisma.licenseKey.update({ where: { id }, data: { isActive } });
    }
    async unlinkDevice(deviceId) {
        return prisma.linkedDevice.delete({ where: { id: deviceId } });
    }
}
exports.KeyService = KeyService;

import { PrismaClient } from '@prisma/client';
import { generateLicenseKey } from '../utils/crypto';

const prisma = new PrismaClient();

export class KeyService {
  async generateKeys(count: number, validUntil: Date, maxDevices: number) {
    const keys = [];
    for (let i = 0; i < count; i++) {
      keys.push({
        keyString: generateLicenseKey(),
        validUntil,
        maxDevices,
      });
    }
    return prisma.licenseKey.createMany({ data: keys });
  }

  async getAllKeys() {
    return prisma.licenseKey.findMany({ include: { devices: true } });
  }

  async toggleActive(id: string, isActive: boolean) {
    return prisma.licenseKey.update({ where: { id }, data: { isActive } });
  }

  async unlinkDevice(deviceId: string) {
    return prisma.linkedDevice.delete({ where: { id: deviceId } });
  }
}

import bcrypt from 'bcryptjs';
import crypto from 'crypto';

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 8);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function generateLicenseKey(): string {
  return Array.from({ length: 3 }, () => 
    crypto.randomBytes(2).toString('hex').toUpperCase()
  ).join('-');
}

export function calculateSHA256(filePath: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash('sha256');
    const stream = require('fs').createReadStream(filePath);
    stream.on('data', (data: any) => hash.update(data));
    stream.on('end', () => resolve(hash.digest('hex')));
    stream.on('error', reject);
  });
}

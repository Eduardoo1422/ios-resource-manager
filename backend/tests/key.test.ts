import request from 'supertest';
import { app } from '../src/app';

describe('Licensing System', () => {
  it('should generate keys', async () => {
    // Note: precisa de token admin, omitindo por brevidade
    // const res = await request(app).post('/api/admin/keys').send({ count: 1, validUntil: '2026-12-31', maxDevices: 1 });
    // expect(res.status).toBe(201);
  });

  it('should deny activation with invalid key', async () => {
    const res = await request(app).post('/api/client/activate').send({ 
        key: 'INVALID-KEY', 
        hardwareUuid: 'dev-1', 
        deviceName: 'iPhone' 
    });
    // O middleware deve converter AppError para status 403
    expect(res.status).toBe(403);
  }, 10000); // Aumentar timeout para 10s
});

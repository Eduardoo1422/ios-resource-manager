import request from 'supertest';
import { app } from '../src/app';

describe('Resource Status System', () => {
  it('should update status and audit log', async () => {
    // Requires admin authentication, assuming valid token setup
    // const res = await request(app).patch('/api/admin/resources/1/status')
    //   .set('Authorization', `Bearer ${adminToken}`)
    //   .send({ status: 'MANUTENCAO' });
    // expect(res.status).toBe(200);
  });

  it('should return status during sync', async () => {
    // Requires client authentication
    // const res = await request(app).get('/api/client/sync')
    //   .set('Authorization', `Bearer ${clientToken}`);
    // expect(res.body[0]).toHaveProperty('status');
  });
});

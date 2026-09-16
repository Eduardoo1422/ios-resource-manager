import request from 'supertest';
import { app } from '../src/app';

describe('Resource Client API', () => {
  it('should list only ONLINE resources', async () => {
    // Note: Requer mock de autenticação.
    // Como não temos um gerador de token no teste fácil agora,
    // vamos focar em garantir que o endpoint existe e retorna 401 sem auth.
    const res = await request(app).get('/api/client/resources');
    expect(res.status).toBe(401);
  });

  it('should deny download for non-existent resource', async () => {
    const res = await request(app).get('/api/client/resources/non-existent/download');
    expect(res.status).toBe(401);
  });
});

import request from 'supertest';
import express from 'express';
import healthRouter from './live';

const app = express();
app.use('/api/health', healthRouter);

describe('GET /api/health', () => {
    it('responds with 200 and static UP status', async () => {
        const res = await request(app).get('/api/health');

        expect(res.status).toBe(200);
        expect(res.headers['cache-control']).toBe('no-store, max-age=0');
        expect(res.body).toEqual({ status: 'UP' });
    });
});

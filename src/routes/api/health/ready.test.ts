import request from 'supertest';
import express from 'express';
import healthRouter from './ready';
import * as healthService from '../../../services/healthService';

const app = express();
app.use('/api/health', healthRouter);

describe('GET /api/health', () => {
    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('returns 200 and health info when status is UP', async () => {
        jest.spyOn(healthService, 'getServerHealth').mockReturnValue({
            status: 'UP',
            checks: {
                http: { status: 'UP' },
                ethereumRpc: {
                    status: 'UP',
                    circuit: 'CLOSED',
                    failureCount: 0,
                    latencyMs: 25,
                    lastFailureTime: undefined
                }
            }
        });

        const res = await request(app).get('/api/health');

        expect(res.status).toBe(200);
        expect(res.headers['cache-control']).toBe('no-store, max-age=0');
        expect(res.body.status).toBe('UP');
    });

    it('returns 503 and health info when status is DEGRADED', async () => {
        jest.spyOn(healthService, 'getServerHealth').mockReturnValue({
            status: 'DEGRADED',
            checks: {
                http: { status: 'UP' },
                ethereumRpc: {
                    status: 'DOWN',
                    circuit: 'OPEN',
                    failureCount: 3,
                    latencyMs: undefined,
                    lastFailureTime: undefined
                }
            }
        });

        const res = await request(app).get('/api/health');

        expect(res.status).toBe(503);
        expect(res.headers['cache-control']).toBe('no-store, max-age=0');
        expect(res.body.status).toBe('DEGRADED');
    });
});

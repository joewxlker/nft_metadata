import request from 'supertest';
import express from 'express';
import contractRouter from './contract';
import { NFT_ABI, NFT_ADDRESS, NFT_CHAIN } from '../../services/nftService';

const app = express();
app.use('/api/contract', contractRouter);

describe('GET /api/contract', () => {
    it('responds with ABI, address, and chain', async () => {
        const res = await request(app).get('/api/contract');

        expect(res.status).toBe(200);
        expect(res.body).toEqual({
            abi: NFT_ABI,
            address: NFT_ADDRESS,
            chain: NFT_CHAIN
        });
    });
});
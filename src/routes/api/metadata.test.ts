// src/routes/metadata.test.ts
import request from 'supertest';
import express from 'express';
import metadataRouter from './metadata';

jest.mock('../../middleware/withRpc', () => ({
    withRpc: (req: any, res: any, next: any) => next(),
}));

jest.mock('../../middleware/validateTokenId', () => ({
    validateTokenId: (req: any, res: any, next: any) => next(),
}));

describe('GET /:tokenId - Metadata Route', () => {
    const app = express();
    app.use('/api/metadata', metadataRouter);

    it('responds with metadata JSON for valid tokenId', async () => {
        const tokenId = 123;
        process.env.SERVER_URL = 'http://localhost:8080';

        const res = await request(app).get(`/api/metadata/${tokenId}`);

        expect(res.status).toBe(200);
        expect(res.header['content-type']).toMatch(/application\/json/);
        expect(res.header['cache-control']).toBe("public, max-age=60, stale-while-revalidate=86400");

        expect(res.body).toEqual({
            name: `Business Card #${tokenId}`,
            description: "A dynamic business card NFT.",
            image: `http://localhost:8080/api/image/${tokenId}`,
            attributes: [
                { trait_type: "Token ID", value: tokenId.toString() },
            ],
        });
    });
});
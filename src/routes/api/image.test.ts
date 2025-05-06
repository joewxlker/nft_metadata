import request from 'supertest';
import express from 'express';
import fs from 'fs';
import path from 'path';
import imageRouter from './image';

const app = express();
app.use('/api/image', imageRouter);

const imagePath = path.join(
    __dirname,
    "..",
    "..",
    "..",
    "assets", 
    "business-card-template.svg"
);

describe('GET /:tokenId - Image Route', () => {
    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('responds with SVG file when it exists', async () => {
        jest.spyOn(fs, 'existsSync').mockImplementation(() => true);
        jest.spyOn(path, "join").mockImplementation(() => imagePath);

        const res = await request(app).get('/api/image/123');

        expect(res.status).toBe(200);
        expect(res.headers['content-type']).toBe('image/svg+xml');
        expect(res.headers['cache-control']).toBe('public, max-age=86400');
        expect(res.body.toString()).toContain("<svg");
    });

    it('responds with 404 when file is missing', async () => {
        jest.spyOn(fs, 'existsSync').mockImplementation(() => false);
        jest.spyOn(path, "join").mockImplementation(() => imagePath);

        const res = await request(app).get('/api/image/123');

        expect(res.status).toBe(404);
    });
});

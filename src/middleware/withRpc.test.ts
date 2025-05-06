import { withRpc } from './withRpc';
import { rpcCheck } from '../services/rpcService';
import { ParsedQs } from "qs";
import { Request, Response, NextFunction } from 'express';

jest.mock('../services/rpcService');

describe('withRpc middleware', () => {
    const mockRequest = {

    } as Request<{ tokenId: string; }, any, any, ParsedQs, Record<string, any>>;
    
    const mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
    } as unknown as Response;
    
    const mockNext = jest.fn();

    afterEach(() => {
        jest.resetAllMocks();
    });

    it('returns 503 when RPC circuit is OPEN', async () => {
        (rpcCheck as jest.Mock).mockReturnValue({ circuit: 'OPEN' });

        await withRpc(mockRequest, mockResponse, mockNext);

        expect(mockResponse.status).toHaveBeenCalledWith(503);
        expect(mockResponse.json).toHaveBeenCalledWith({ error: 'RPC service is down' });
        expect(mockNext).not.toHaveBeenCalled();
    });

    it('calls next() when RPC circuit is HALF_OPEN', async () => {
        (rpcCheck as jest.Mock).mockReturnValue({ circuit: 'HALF_OPEN' });

        await withRpc(mockRequest, mockResponse, mockNext);

        expect(mockNext).toHaveBeenCalled();
        expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it('calls next() when RPC circuit is CLOSED', async () => {
        (rpcCheck as jest.Mock).mockReturnValue({ circuit: 'CLOSED' });

        await withRpc(mockRequest, mockResponse, mockNext);

        expect(mockNext).toHaveBeenCalled();
        expect(mockResponse.status).not.toHaveBeenCalled();
    });
});

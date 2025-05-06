import { Request, Response } from "express";
import { validateTokenId } from "./validateTokenId";
import { ParsedQs } from "qs";
import * as nftService from "../services/nftService"; 

describe("validateTokenId", () => {
    const mockRequest = {
        params: { tokenId: "0" }
    } as Request<{ tokenId: string; }, any, any, ParsedQs, Record<string, any>>;

    const mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
    } as unknown as Response;

    const mockNext = jest.fn();

    afterEach(() => {
        jest.resetAllMocks();
    });

    it("returns 400 for invalid tokenId parameter", async () => {
        mockRequest.params = { tokenId: 'abc' };

        await validateTokenId(mockRequest, mockResponse, mockNext);
        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({ error: "Invalid tokenId parameter" });
    });

    it("returns 404 for invalid tokenIds", async () => {
        mockRequest.params = { tokenId: '123' };
        jest.spyOn(nftService, 'isValidTokenId').mockResolvedValue(false);

        await validateTokenId(mockRequest, mockResponse, mockNext);
        expect(mockResponse.status).toHaveBeenCalledWith(404);
        expect(mockResponse.json).toHaveBeenCalledWith({ error: "Token not found" });
    });

    it('calls next() and attaches tokenId if valid', async () => {
        mockRequest.params = { tokenId: '42' };
        jest.spyOn(nftService, 'isValidTokenId').mockResolvedValue(true);

        await validateTokenId(mockRequest, mockResponse, mockNext);

        expect(mockRequest.tokenId).toBe(42);
        expect(mockNext).toHaveBeenCalled();
        expect(mockResponse.status).not.toHaveBeenCalled();
    });
});
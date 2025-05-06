import { Request, Response, NextFunction } from "express";
import { rpcCheck } from "../services/rpcService";
import expressAsyncHandler from "express-async-handler";
import { Metadata } from "../types/metadata";

export const withRpc = expressAsyncHandler<{ tokenId: string }, Metadata>(async (_req: Request, res: Response, next: NextFunction) => {
    if (rpcCheck().circuit === "OPEN") {
        res.status(503).json({ error: "RPC service is down" });
        return;
    }

    next();
});
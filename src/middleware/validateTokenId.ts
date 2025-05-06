import { Request, Response, NextFunction } from "express";
import expressAsyncHandler from "express-async-handler";
import { isValidTokenId } from "../services/nftService";

declare global {
    namespace Express {
        interface Request {
            tokenId?: number;
        }
    }
}

export const validateTokenId = expressAsyncHandler<{ tokenId: string }>(async (req: Request, res: Response, next: NextFunction) => {
    const raw = req.params.tokenId;
    const tokenId = Number(raw);

    if (!Number.isInteger(tokenId)) {
        res.status(400);
        res.json({ error: "Invalid tokenId parameter" });
        return;
    }

    const isValidToken = await isValidTokenId(tokenId);
    if (!isValidToken) {
        res.status(404);
        res.json({ error: "Token not found" });
        return;
    }

    req.tokenId = tokenId;
    next();
});

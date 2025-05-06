import { Request, Response, Router } from "express";
import { Metadata } from "../../types/metadata";
import { validateTokenId } from "../../middleware/validateTokenId";
import { withRpc } from "../../middleware/withRpc";

const router = Router();

const getMetadata = async (req: Request, res: Response) => {
    const tokenId = Number(req.params.tokenId);

    const metadata: Metadata = {
        name: `Business Card #${tokenId}`,
        description: "A dynamic business card NFT.",
        image: `${process.env.SERVER_URL}/api/image/${tokenId}`,
        attributes: [
            { trait_type: "Token ID", value: tokenId.toString() },
        ]
    };

    res.setHeader("Content-Type", "application/json");
    res.set("Cache-Control", "public, max-age=60, stale-while-revalidate=86400");
    res.json(metadata);
}

router.get("/:tokenId", withRpc, validateTokenId, getMetadata);

export default router;
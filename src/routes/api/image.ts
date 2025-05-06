import { Router } from "express";
import { Request, Response } from "express";
import path from "path";
import fs from "fs";

const router = Router();

const getImage = async (_req: Request, res: Response) => {
    const filePath = path.join(
        __dirname,
        "..",
        "..",
        "assets", 
        "business-card-template.svg"
    );

    if (!fs.existsSync(filePath)) {
        res.sendStatus(404);
        return;
    }

    res.set("Content-Type", "image/svg+xml");
    res.set("Cache-Control", "public, max-age=86400");
    res.sendFile(filePath);
}

router.get("/:tokenId", getImage);

export default router;
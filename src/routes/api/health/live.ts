import { Router, Request, Response } from "express";

const router = Router();

router.get("/", (_req: Request, res: Response) => {
    res.set("Cache-Control", "no-store, max-age=0");
    res.status(200);
    res.send({ status: "UP" });
});

export default router;
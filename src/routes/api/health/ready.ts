import { Router, Request, Response } from "express";
import { getServerHealth } from "../../../services/healthService";

const router = Router();

router.get("/", (_req: Request, res: Response) => {
    const health = getServerHealth();

    const code = health.status === "UP" ? 200 : 503;

    res.set("Cache-Control", "no-store, max-age=0");
    res.status(code);
    res.json(health);
});

export default router;
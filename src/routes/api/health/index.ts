import { Router } from "express";
import liveRouter from "./live";
import readyRouter from "./ready";

const router = Router();

router.use("/live", liveRouter);
router.use("/ready", readyRouter);

export default router;
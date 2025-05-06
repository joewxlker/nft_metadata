import { Router } from "express";
import contractRouter from "./contract";
import metadataRouter from "./metadata";
import imageRouter from "./image";
import healthRouter from "./health";

const router = Router();

router.use("/health", healthRouter);
router.use("/contract", contractRouter);
router.use("/metadata", metadataRouter);
router.use("/image", imageRouter);

export default router;
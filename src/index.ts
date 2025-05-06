import express, { Request, Response, NextFunction } from "express";
import apiRouter from "./routes/api";
import dotenv from "dotenv";

dotenv.config();

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", apiRouter);

app.use((_req: Request, res: Response) => {
  res.status(404).json({ error: "Not Found" });
});

app.use((err: any, _req: Request, res: Response, next: NextFunction) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ error: "Internal Server Error" });
});

const port = process.env.PORT || 8080;
const server = app.listen(port, () => {
  console.log(`🚀 Server listening on http://localhost:${port}`);
});

server.on("error", (...args) => {
  console.error(args);
});
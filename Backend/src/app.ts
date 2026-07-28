import cors from "cors";
import express, { type Request, type Response } from "express";

const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  }),
);

app.use(express.json());

app.get("/api/health", (_request: Request, response: Response) => {
  response.status(200).json({
    success: true,
    message: "TenantRelay API is running",
  });
});

export default app;
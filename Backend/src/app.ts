import cors from "cors";
import express, { type Request, type Response } from "express";
import authRouter from "./routes/auth.routes.js";

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

app.use("/api/auth", authRouter);

export default app;
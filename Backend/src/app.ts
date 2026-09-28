import cors from "cors";
import express, { type Request, type Response } from "express";
import authRouter from "./routes/auth.routes.js";
import workspaceRouter from "./routes/workspace.routes.js";
import webhookRouter from "./routes/webhook.routes.js"
import eventRouter from "./routes/event.routes.js";
import apiKeyRouter from "./routes/apiKey.routes.js";
import "./config/redis.js";


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
app.use("/api/workspace",workspaceRouter);
app.use("/api/webhooks",webhookRouter);
app.use("/api/events", eventRouter);
app.use("/api/api-keys",apiKeyRouter)

export default app;
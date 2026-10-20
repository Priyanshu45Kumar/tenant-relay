import "dotenv/config";
import app from "./app.js";
import { connectDatabase } from "./config/database.js";
import { startWebhookWorker } from "./workers/webhook.worker.js";

const PORT = Number(process.env.PORT) || 5000;

const startServer = async (): Promise<void> => {
  try {
    await connectDatabase();

    app.listen(PORT, () => {
      console.log(`TenantRelay API running on port ${PORT}`);

      // Start the BullMQ worker alongside the API.
      void startWebhookWorker().catch((error: unknown) => {
        console.error("Failed to start webhook worker:", error);
      });
    });
  } catch (error) {
    console.error("Failed to start TenantRelay server:", error);
    process.exit(1);
  }
};

startServer();
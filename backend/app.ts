import "reflect-metadata";
import express, { Application, Request, Response, NextFunction } from "express";
import { configService } from "./config/config.service";
import { initializeDatabase } from "./config/database";

const app: Application = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get("/health", (req: Request, res: Response) => {
  res.status(200).json({
    status: "ok",
    timestamp: new Date().toISOString(),
    environment: configService.nodeEnv,
  });
});

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: "Route not found" });
});

// Error handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error("Error:", err);
  res.status(500).json({
    error: "Internal server error",
    message: configService.isDevelopment ? err.message : undefined,
  });
});

// Bootstrap function
const bootstrap = async () => {
  try {
    console.log("Starting application...");

    // Initialize database connection
    await initializeDatabase();

    // Start server
    const port = configService.port;
    app.listen(port, () => {
      console.log(`Server is running on http://localhost:${port}`);
    });
  } catch (error) {
    console.error("Failed to start application:", error);
    process.exit(1); // Exit with error code
  }
};

// Start the application
bootstrap();

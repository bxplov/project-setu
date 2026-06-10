import { createServer } from "http";
import { Server } from "socket.io";
import mongoose from "mongoose";
import app from "./app.js";
import { env } from "./config/env.js";

const httpServer = createServer(app);
import { socketService } from "./services/socket.service.js";

// Initialize Socket Service
socketService.init(httpServer, env.CORS_ORIGIN);

// Socket logic now handled in services/socket.service.js

const startHttpServer = () => {
  httpServer.listen(env.PORT, "0.0.0.0", () => {
    console.log(
      `🚀 Server running on port ${env.PORT} in ${env.NODE_ENV} mode`,
    );
  });
};

const connectDatabase = async () => {
  try {
    await mongoose.connect(env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
    });

    console.log("✅ MongoDB Connected");
  } catch (err) {
    console.error(
      "⚠️ MongoDB connection failed. Retrying in 5 seconds...",
      err.message,
    );
    setTimeout(connectDatabase, 5000);
  }
};

// Database Connection & Server Start
const startServer = async () => {
  startHttpServer();
  await connectDatabase();
};

// Graceful Shutdown
const shutdown = () => {
  console.log("🛑 SIGTERM received. Shutting down...");
  const io = socketService.getIO();
  io.close(() => console.log("Socket server closed"));
  httpServer.close(() => {
    console.log("HTTP server closed");
    mongoose.connection.close(false, () => {
      console.log("MongoDB connection closed");
      process.exit(0);
    });
  });
};

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);

startServer();

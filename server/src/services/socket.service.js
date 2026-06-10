import { Server } from "socket.io";
import { User } from "../models/User.js";
import { Message } from "../models/Message.js";
import { Incident } from "../models/Incident.js";
import { env } from "../config/env.js";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";

class SocketService {
  constructor() {
    this.io = null;
  }

  init(httpServer, corsOrigin) {
    this.io = new Server(httpServer, {
      cors: {
        origin: corsOrigin,
        methods: ["GET", "POST"],
      },
    });

    this.io.on("connection", (socket) => this.handleConnection(socket));
    console.log("✅ Socket Service Initialized");
  }

  getIO() {
    return this.io;
  }

  // System Mode State
  systemMode = "PEACE"; // Default

  setMode(mode) {
    this.systemMode = mode;
    if (this.io) {
      this.io.emit("system:mode_change", { mode });
    }
    console.log(`🔄 System Mode changed to: ${mode}`);
  }

  getMode() {
    return this.systemMode;
  }

  isDatabaseReady() {
    return mongoose.connection.readyState === 1;
  }

  emitDatabaseUnavailable(socket, callback) {
    const payload = {
      message:
        "DATABASE_UNAVAILABLE: MongoDB is not connected yet. Please retry shortly.",
    };

    if (callback) {
      callback({ status: "error", error: payload.message });
    }

    socket.emit("auth:error", payload);
  }

  handleConnection(socket) {
    console.log(`🔌 New Client: ${socket.id}`);

    // JOIN Event (Auth)
    socket.on(
      "auth:join",
      async ({ username, role = "civilian", adminToken = null }) => {
        try {
          if (!this.isDatabaseReady()) {
            this.emitDatabaseUnavailable(socket);
            return;
          }

          // SERVER-SIDE ADMIN ROLE VERIFICATION
          // If client claims admin role, verify the admin token
          let verifiedRole = role;
          if (role === "admin") {
            try {
              if (!adminToken) throw new Error('No token provided');
              const decoded = jwt.verify(adminToken, env.JWT_SECRET);
              if (decoded.role !== 'admin') throw new Error('Invalid role payload');
              console.log(`🔐 Admin access verified for "${username}" via JWT`);
            } catch (err) {
              // Reject: downgrade to civilian and notify client
              console.warn(
                `⚠️ Unauthorized admin attempt by "${username}" — downgrading to civilian (${err.message})`
              );
              verifiedRole = "civilian";
              socket.emit("auth:error", {
                message:
                  "ACCESS_DENIED: Invalid admin credentials. Connected as civilian.",
              });
            }
          }

          const user = await User.findOneAndUpdate(
            { username },
            {
              $set: {
                socketId: socket.id,
                lastSeen: new Date(),
                role: verifiedRole,
              },
              $setOnInsert: { isSafe: true },
            },
            { upsert: true, new: true },
          );

          socket.data.user = user;
          socket.broadcast.emit("user:online", user);

          // Send success + Current System Mode
          socket.emit("auth:success", {
            userId: user._id,
            role: user.role,
            mode: this.systemMode,
            token: adminToken, // Pass token back to persist it on client
          });

          // Fetch and send message history
          // Privacy measure: Civilians only get history during DISASTER mode, and ONLY messages sent during DISASTER mode.
          if (verifiedRole === 'admin' || this.systemMode === 'DISASTER') {
            const query = verifiedRole === 'admin' ? {} : { systemMode: 'DISASTER' };
            const recentMessages = await Message.find(query)
              .sort({ createdAt: -1 })
              .limit(50)
              .lean();
              
            socket.emit("message:history", recentMessages.reverse());
          }

          console.log(`👤 User joined: ${username} (role: ${verifiedRole})`);
        } catch (err) {
          console.error("Join Error:", err);
          socket.emit("error", { message: "Failed to join" });
        }
      },
    );

    // CHAT Event
    socket.on("message:send", async (payload, callback) => {
      try {
        if (!this.isDatabaseReady()) {
          if (callback) {
            callback({
              status: "error",
              error: "DATABASE_UNAVAILABLE: MongoDB is not connected yet.",
            });
          }
          return;
        }

        if (!socket.data.user) throw new Error("Unauthorized");
        if (!payload.content || typeof payload.content !== 'string') throw new Error("Invalid payload");

        const sanitizedContent = payload.content.trim().substring(0, 300);
        if (!sanitizedContent) throw new Error("Empty message");

        const msg = await Message.create({
          senderId: socket.data.user._id,
          senderName: socket.data.user.username,
          content: sanitizedContent,
          type: payload.type || "text",
          systemMode: this.systemMode // Track the mode during which this was sent
        });

        // Broadcast to all except sender
        socket.broadcast.emit("message:receive", msg);

        // Acknowledge receipt
        if (callback) callback({ status: "ok", id: msg._id });
      } catch (err) {
        if (callback) callback({ status: "error", error: err.message });
      }
    });

    socket.on('typing:start', () => {
      socket.broadcast.emit('user:typing', { username: socket.data.user?.username });
    });

    socket.on('typing:stop', () => {
      socket.broadcast.emit('user:stop_typing', { username: socket.data.user?.username });
    });

    socket.on("message:delete", async (payload, callback) => {
      try {
        if (!this.isDatabaseReady()) return;
        if (!socket.data.user || socket.data.user.role !== "admin") {
          throw new Error("Unauthorized: Admin only");
        }
        
        if (mongoose.Types.ObjectId.isValid(payload.msgId)) {
          await Message.findByIdAndDelete(payload.msgId);
        }
        
        this.io.emit("message:deleted", { msgId: payload.msgId });
        if (callback) callback({ status: "ok" });
      } catch (err) {
        console.error("Delete Msg Error:", err);
        if (callback) callback({ status: "error", error: err.message });
      }
    });

    socket.on("message:clear_all", async (callback) => {
      try {
        if (!this.isDatabaseReady()) return;
        if (!socket.data.user || socket.data.user.role !== "admin") {
          throw new Error("Unauthorized: Admin only");
        }
        await Message.deleteMany({});
        this.io.emit("message:cleared_all");
        if (callback) callback({ status: "ok" });
      } catch (err) {
        console.error("Clear Msg Error:", err);
        if (callback) callback({ status: "error", error: err.message });
      }
    });

    // SOS Event
    socket.on("incident:report", async (payload) => {
      try {
        if (!this.isDatabaseReady()) {
          socket.emit("system:error", {
            message: "DATABASE_UNAVAILABLE: MongoDB is not connected yet.",
          });
          return;
        }

        const incident = await Incident.create({
          reporterId: socket.data.user?._id, // Might be anon if critical? No, enforce user
          type: payload.type || "SOS",
          coordinates: payload.coordinates,
        });

        this.io.emit("incident:new", incident); // Broadcast to EVERYONE immediately
      } catch (err) {
        console.error("SOS Error:", err);
      }
    });

    // DISCONNECT
    socket.on("disconnect", async () => {
      console.log(`❌ Client disconnected: ${socket.id}`);
      if (socket.data.user && this.isDatabaseReady()) {
        await User.findByIdAndUpdate(socket.data.user._id, {
          socketId: null,
          lastSeen: new Date(),
        });
        socket.broadcast.emit("user:offline", { userId: socket.data.user._id });
      }
    });
  }
}

export const socketService = new SocketService();

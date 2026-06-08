import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import cors from "cors";
import validator from "validator";
import {
  connectToDatabase,
  getDb,
  getCollections,
  getUsersCollection,
  getUserHealthCollection,
} from "./db.js";

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: "*", methods: ["GET", "POST"] },
});

const PORT = process.env.PORT || 3000;
let isDbConnected = false;
let usersCollection = null;
let userHealthCollection = null;
try {
  await connectToDatabase();
  usersCollection = getUsersCollection();
  userHealthCollection = getUserHealthCollection();
  isDbConnected = true;
} catch (error) {
  if (error?.message?.includes("ENOTFOUND")) {
    console.error(
      "MongoDB connection failed: DNS could not resolve the Atlas hostname.",
    );
  } else {
    console.error("MongoDB connection failed:", error.message);
  }
}

app.use(cors());
app.use(express.json());

// ── In-memory socket state ──────────────────────────────────────────────────
// proId → { socketId, proId, name, role }
const onlinePros = new Map();
// socketId → { type: 'pro'|'user', id, name, proId? }
const socketMeta = new Map();

function broadcastProsUpdated() {
  const pros = Array.from(onlinePros.values()).map(({ proId, name, role }) => ({
    proId,
    name,
    role,
  }));
  io.emit("pros:updated", pros);
}

// ── REST endpoints ──────────────────────────────────────────────────────────
app.get("/", (req, res) => {
  res.send("Server is running!");
});

app.get("/health", (req, res) => {
  if (!isDbConnected) {
    return res.status(503).json({
      status: "degraded",
      dbConnected: false,
      message: "Database is not connected",
    });
  }
  const db = getDb();
  const collections = Object.keys(getCollections());
  return res.json({
    status: "ok",
    dbConnected: true,
    databaseName: db.databaseName,
    declaredCollectionsConnected: {
      users: Boolean(usersCollection),
      user_health: Boolean(userHealthCollection),
    },
    collections,
  });
});

app.get("/me", async (req, res) => {
  const { email } = req.query;
  if (!email) {
    return res
      .status(400)
      .json({ success: false, message: "email query param required" });
  }
  if (!usersCollection) {
    return res.status(503).json({ success: false, message: "DB not ready" });
  }
  try {
    const user = await usersCollection.findOne({
      email: email.trim().toLowerCase(),
    });
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    return res.json({
      success: true,
      user: {
        _id: user._id,
        email: user.email,
        name: user.name,
        isProfessional: Boolean(user.isProfessional),
        professionalRole: user.professionalRole || null,
      },
    });
  } catch {
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

app.post("/become-pro", async (req, res) => {
  try {
    const { email, professionalRole } = req.body;
    if (!email)
      return res
        .status(400)
        .json({ success: false, message: "email is required" });
    if (!usersCollection)
      return res.status(503).json({ success: false, message: "DB not ready" });
    const normalizedEmail = email.trim().toLowerCase();
    const result = await usersCollection.updateOne(
      { email: normalizedEmail },
      {
        $set: {
          isProfessional: true,
          professionalRole:
            professionalRole || "Licensed Mental Health Counselor",
        },
      },
    );
    if (result.matchedCount === 0) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    const updated = await usersCollection.findOne({ email: normalizedEmail });
    return res.json({
      success: true,
      message: "User is now a professional.",
      user: {
        _id: updated._id,
        email: updated.email,
        name: updated.name,
        isProfessional: true,
        professionalRole: updated.professionalRole,
      },
    });
  } catch {
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

app.post("/register", async (req, res) => {
  try {
    const result = await registerUser(req.body, usersCollection);
    const { statusCode, success, message, user } = result;
    return res
      .status(statusCode)
      .json({ success, message, ...(user && { user }) });
  } catch {
    return res.status(500).json({
      success: false,
      message: "An unexpected error occurred on the server.",
    });
  }
});

app.post("/login", async (req, res) => {
  try {
    const user = await signInUser(req.body, usersCollection);
    return res
      .status(200)
      .json({ success: true, message: "Signed in successfully.", user });
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: error.message || "Invalid email or password.",
    });
  }
});

app.get("/professionals/online", (req, res) => {
  const pros = Array.from(onlinePros.values()).map(({ proId, name, role }) => ({
    proId,
    name,
    role,
  }));
  return res.json({ success: true, professionals: pros });
});

app.get("/user-health/today", async (req, res) => {
  await getTodayUserMood(req.query, userHealthCollection);
  res.status(501).json({ message: "getTodayUserMood not implemented yet" });
});

app.post("/user-health/today", async (req, res) => {
  await saveTodayUserMood(req.body, userHealthCollection);
  res.status(501).json({ message: "saveTodayUserMood not implemented yet" });
});

// ── Socket.io ───────────────────────────────────────────────────────────────
io.on("connection", (socket) => {
  console.log(`Socket connected: ${socket.id}`);

  // Send current state immediately so the new client doesn't need to wait for the next broadcast
  const currentPros = Array.from(onlinePros.values()).map(
    ({ proId, name, role }) => ({
      proId,
      name,
      role,
    }),
  );
  socket.emit("pros:updated", currentPros);

  // Pro goes online
  socket.on("pro:go-online", ({ proId, name, role }) => {
    onlinePros.set(proId, { socketId: socket.id, proId, name, role });
    socketMeta.set(socket.id, { type: "pro", id: proId, name });
    socket.join(`pro:${proId}`);
    broadcastProsUpdated();
    console.log(`Pro online: ${name} (${proId})`);
  });

  // Pro goes offline manually
  socket.on("pro:go-offline", ({ proId }) => {
    onlinePros.delete(proId);
    socket.leave(`pro:${proId}`);
    const meta = socketMeta.get(socket.id);
    if (meta) socketMeta.set(socket.id, { ...meta, type: "idle" });
    broadcastProsUpdated();
    console.log(`Pro offline: ${proId}`);
  });

  // User joins a pro's room
  socket.on("user:join-room", ({ proId, userId, userName }) => {
    const roomId = `pro:${proId}`;
    socket.join(roomId);
    socketMeta.set(socket.id, {
      type: "user",
      id: userId,
      name: userName,
      proId,
    });
    // Notify the pro
    socket.to(roomId).emit("room:user-joined", { userId, userName });
    // System message in the room
    io.to(roomId).emit("room:message", {
      id: `sys-${Date.now()}`,
      sender: "system",
      senderName: "System",
      text: `${userName} has joined the chat.`,
      timestamp: Date.now(),
    });
    console.log(`User ${userName} joined room ${roomId}`);
  });

  // User leaves a pro's room
  socket.on("user:leave-room", ({ proId, userId, userName }) => {
    const roomId = `pro:${proId}`;
    socket.leave(roomId);
    socket.to(roomId).emit("room:user-left", { userId, userName });
    io.to(roomId).emit("room:message", {
      id: `sys-${Date.now()}`,
      sender: "system",
      senderName: "System",
      text: `${userName} has left the chat.`,
      timestamp: Date.now(),
    });
    const meta = socketMeta.get(socket.id);
    if (meta) socketMeta.set(socket.id, { ...meta, proId: null });
  });

  // Any participant sends a message
  socket.on(
    "message:send",
    ({ proId, senderId, senderName, senderRole, text }) => {
      const roomId = `pro:${proId}`;
      const message = {
        id: `msg-${Date.now()}-${Math.random().toString(36).slice(2)}`,
        sender: senderRole,
        senderName,
        text,
        timestamp: Date.now(),
      };
      io.to(roomId).emit("room:message", message);
    },
  );

  // Cleanup on disconnect
  socket.on("disconnect", () => {
    const meta = socketMeta.get(socket.id);
    if (meta?.type === "pro") {
      onlinePros.delete(meta.id);
      broadcastProsUpdated();
      console.log(`Pro disconnected: ${meta.name} (${meta.id})`);
    }
    if (meta?.type === "user" && meta.proId) {
      io.to(`pro:${meta.proId}`).emit("room:message", {
        id: `sys-${Date.now()}`,
        sender: "system",
        senderName: "System",
        text: `${meta.name} has disconnected.`,
        timestamp: Date.now(),
      });
    }
    socketMeta.delete(socket.id);
  });
});

async function registerUser(body, collection) {
  if (!collection) {
    return {
      success: false,
      statusCode: 500,
      message: "Database collection is not initialized.",
    };
  }

  const { email, password, name, isProfessional, professionalRole } = body;

  if (!email || !password) {
    return {
      success: false,
      statusCode: 400,
      message: "Email and password are required.",
    };
  }

  const normalizedEmail = email.trim().toLowerCase();
  if (!validator.isEmail(normalizedEmail)) {
    return {
      success: false,
      statusCode: 400,
      message: "Invalid email format.",
    };
  }

  if (password.length < 8) {
    return {
      success: false,
      statusCode: 400,
      message: "Password must be at least 8 characters long.",
    };
  }

  try {
    const existingUser = await collection.findOne({ email: normalizedEmail });
    if (existingUser) {
      return {
        success: false,
        statusCode: 409,
        message: "User with this email already exists.",
      };
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = {
      email: normalizedEmail,
      passwordHash: hashedPassword,
      name: name || null,
      isProfessional: Boolean(isProfessional),
      professionalRole: isProfessional
        ? professionalRole || "Licensed Mental Health Counselor"
        : null,
      createdAt: new Date(),
    };

    const result = await collection.insertOne(newUser);

    return {
      success: true,
      statusCode: 201,
      message: "User registered successfully.",
      user: {
        _id: result.insertedId,
        email: newUser.email,
        name: newUser.name,
        isProfessional: newUser.isProfessional,
        professionalRole: newUser.professionalRole,
      },
    };
  } catch {
    return {
      success: false,
      statusCode: 500,
      message: "An internal server error occurred during registration.",
    };
  }
}

async function signInUser(credentials, collection) {
  const { email, password } = credentials;

  if (!email || !password) {
    throw new Error("Email and password are required.");
  }

  if (!collection) {
    throw new Error("Users collection is not initialized.");
  }

  const user = await collection.findOne({ email: email.trim().toLowerCase() });
  if (!user) {
    throw new Error("Invalid email or password.");
  }

  const isPasswordValid = await bcrypt.compare(
    password,
    user.passwordHash || user.password,
  );
  if (!isPasswordValid) {
    throw new Error("Invalid email or password.");
  }

  return {
    _id: user._id,
    email: user.email,
    name: user.name,
    isProfessional: Boolean(user.isProfessional),
    professionalRole: user.professionalRole || null,
  };
}

// Implement reading today's mood entry for the signed-in user from user_health.
async function getTodayUserMood() {}

// Implement upserting today's mood entry for the signed-in user into user_health.
async function saveTodayUserMood() {}

httpServer.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

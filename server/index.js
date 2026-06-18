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
  getConversationsCollection,
  getConversationMessagesCollection,
} from "./db.js";
import { ObjectId } from "mongodb";

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
let conversationsCollection = null;
let conversationMessagesCollection = null;
try {
  await connectToDatabase();
  usersCollection = getUsersCollection();
  userHealthCollection = getUserHealthCollection();
  conversationsCollection = getConversationsCollection();
  conversationMessagesCollection = getConversationMessagesCollection();
  isDbConnected = true;
} catch (error) {
  if (error?.message?.includes("ENOTFOUND")) {
    console.error(
      "MongoDB connection failed: DNS could not resolve the Atlas hostname.",
    );
  } else {
    console.error("MongoDB connection failed:", error.message);
  }
  console.error(
    "The backend cannot start without a valid MongoDB connection.\n" +
      "Set MONGODB_URI in a .env file or environment variable, then restart the server.",
  );
  process.exit(1);
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
      conversations: Boolean(conversationsCollection),
      conversation_messages: Boolean(conversationMessagesCollection),
    },
    collections,
  });
});

// Conversations: create or get (prevents duplicate direct conversations)
app.post("/conversations", async (req, res) => {
  try {
    const { participants, type = "user-user", title = null, isGroup = false, aiAssistant = null, memory = false } = req.body;
    if (!Array.isArray(participants) || participants.length === 0) {
      return res.status(400).json({ success: false, message: "participants array is required." });
    }

    // For non-group direct conversations, ensure a single conversation exists for the exact set of participants
    if (!isGroup && participants.length === 2) {
      const participantIds = participants.map((p) => p.userId);
      const existing = await conversationsCollection.findOne({
        isGroup: false,
        $and: [
          { "participants.userId": participantIds[0] },
          { "participants.userId": participantIds[1] },
        ],
      });
      if (existing) {
        if (memory && !existing.memory) {
          await conversationsCollection.updateOne(
            { _id: existing._id },
            { $set: { memory: true, updatedAt: new Date() } },
          );
          existing.memory = true;
        }
        return res.status(200).json({ success: true, conversation: existing, existed: true });
      }
    }

    const now = new Date();
    const conv = {
      type,
      participants,
      title,
      isGroup: Boolean(isGroup),
      aiAssistant: aiAssistant || null,
      createdAt: now,
      updatedAt: now,
      lastMessage: null,
      memory: Boolean(memory),
    };

    const result = await conversationsCollection.insertOne(conv);
    conv.id = result.insertedId;
    return res.status(201).json({ success: true, conversation: conv });
  } catch (error) {
    console.error("Route Error /conversations:", error);
    return res.status(500).json({ success: false, message: "Internal server error." });
  }
});

// List conversations for a user
app.get("/conversations", async (req, res) => {
  try {
    const { userId, memory } = req.query;
    if (!userId) {
      return res.status(400).json({ success: false, message: "userId query parameter is required." });
    }

    const filters = { "participants.userId": userId };
    if (memory !== undefined) {
      filters.memory = memory === "true" || memory === "1";
    }

    const convs = await conversationsCollection.find(filters).sort({ updatedAt: -1 }).toArray();
    return res.status(200).json({ success: true, conversations: convs });
  } catch (error) {
    console.error("Route Error GET /conversations:", error);
    return res.status(500).json({ success: false, message: "Internal server error." });
  }
});

// Get remembered conversations for a user
app.get("/conversations/memory", async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) {
      return res.status(400).json({ success: false, message: "userId query parameter is required." });
    }
    const convs = await conversationsCollection
      .find({ "participants.userId": userId, memory: true })
      .sort({ updatedAt: -1 })
      .toArray();
    return res.status(200).json({ success: true, conversations: convs });
  } catch (error) {
    console.error("Route Error GET /conversations/memory:", error);
    return res.status(500).json({ success: false, message: "Internal server error." });
  }
});

// Add a message to a conversation
app.post("/conversations/:id/messages", async (req, res) => {
  try {
    const { id } = req.params;
    const { senderId, text, metadata = null } = req.body;
    if (!ObjectId.isValid(id)) return res.status(400).json({ success: false, message: "Invalid conversation id." });
    if (!senderId || !text) return res.status(400).json({ success: false, message: "senderId and text are required." });

    const message = {
      conversationId: new ObjectId(id),
      senderId,
      text,
      metadata,
      createdAt: new Date(),
    };

    await conversationMessagesCollection.insertOne(message);
    await conversationsCollection.updateOne({ _id: new ObjectId(id) }, { $set: { lastMessage: { senderId, text, createdAt: message.createdAt }, updatedAt: new Date() } });

    return res.status(201).json({ success: true, message });
  } catch (error) {
    console.error("Route Error POST /conversations/:id/messages:", error);
    return res.status(500).json({ success: false, message: "Internal server error." });
  }
});

// Get messages for a conversation
app.get("/conversations/:id/messages", async (req, res) => {
  try {
    const { id } = req.params;
    if (!ObjectId.isValid(id)) return res.status(400).json({ success: false, message: "Invalid conversation id." });
    const msgs = await conversationMessagesCollection.find({ conversationId: new ObjectId(id) }).sort({ createdAt: 1 }).toArray();
    return res.status(200).json({ success: true, messages: msgs });
  } catch (error) {
    console.error("Route Error GET /conversations/:id/messages:", error);
    return res.status(500).json({ success: false, message: "Internal server error." });
  }
});

// Toggle conversation memory (remember conversations)
app.patch("/conversations/:id/memory", async (req, res) => {
  try {
    const { id } = req.params;
    const { remember } = req.body;
    if (!ObjectId.isValid(id)) return res.status(400).json({ success: false, message: "Invalid conversation id." });
    const result = await conversationsCollection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: { memory: Boolean(remember), updatedAt: new Date() } },
      { returnDocument: "after" },
    );
    if (!result.value) {
      return res.status(404).json({ success: false, message: "Conversation not found." });
    }
    return res.status(200).json({ success: true, conversation: result.value });
  } catch (error) {
    console.error("Route Error PATCH /conversations/:id/memory:", error);
    return res.status(500).json({ success: false, message: "Internal server error." });
  }
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

app.post("/account/delete", async (req, res) => {
  try {
    const { email, password, keepSafe = false } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email and password are required." });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await usersCollection.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash || user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ success: false, message: "Invalid email or password." });
    }

    if (keepSafe) {
      await usersCollection.updateOne(
        { _id: user._id },
        { $set: { deleted: true, deletedAt: new Date(), keepSafe: true } },
      );
      return res.status(200).json({ success: true, message: "Account archived safely. You can restore it later." });
    }

    const userIdString = user._id.toString();
    const deletedConversations = await conversationsCollection
      .find({ "participants.userId": userIdString })
      .project({ _id: 1 })
      .toArray();
    const conversationIds = deletedConversations.map((conversation) => conversation._id);

    await conversationMessagesCollection.deleteMany({ conversationId: { $in: conversationIds } });
    await conversationsCollection.deleteMany({ _id: { $in: conversationIds } });
    await userHealthCollection.deleteMany({ userId: userIdString });
    await usersCollection.deleteOne({ _id: user._id });

    return res.status(200).json({ success: true, message: "Account and related data were permanently deleted." });
  } catch (error) {
    console.error("Route Error /account/delete:", error);
    return res.status(500).json({ success: false, message: "Internal server error." });
  }
});

// Delete conversation history only (keeps user account)
app.post("/account/delete-history", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email and password are required." });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await usersCollection.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash || user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ success: false, message: "Invalid email or password." });
    }

    const userIdString = user._id.toString();

    // Delete messages authored by the user
    await conversationMessagesCollection.deleteMany({ senderId: userIdString });

    // Remove the user from any conversation participant lists
    await conversationsCollection.updateMany(
      { "participants.userId": userIdString },
      { $pull: { participants: { userId: userIdString } }, $set: { updatedAt: new Date() } },
    );

    // Find conversations that now have zero participants and remove them (and any orphaned messages)
    const emptyConvs = await conversationsCollection.find({ participants: { $size: 0 } }).project({ _id: 1 }).toArray();
    if (emptyConvs.length > 0) {
      const ids = emptyConvs.map((c) => c._id);
      await conversationMessagesCollection.deleteMany({ conversationId: { $in: ids } });
      await conversationsCollection.deleteMany({ _id: { $in: ids } });
    }

    return res.status(200).json({ success: true, message: "Conversation history removed. Your account remains intact." });
  } catch (error) {
    console.error("Route Error /account/delete-history:", error);
    return res.status(500).json({ success: false, message: "Internal server error." });
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
  socket.on("user:join-room", async ({ proId, userId, userName }) => {
    // Create a private room per user-professional pair so each user has their own chat with the pro
    const roomId = `pro:${proId}:user:${userId}`;
    socket.join(roomId);
    socketMeta.set(socket.id, {
      type: "user",
      id: userId,
      name: userName,
      proId,
    });

    const proMeta = onlinePros.get(proId);
    let conversationId = null;
    try {
      const proName = proMeta?.name || "Professional";
      const conversation = await getOrCreateDirectConversation(proId, userId, proName, userName);
      conversationId = conversation._id.toString();
    } catch (err) {
      console.warn("Failed to get or create conversation:", err?.message || err);
    }

    // If the pro is online, have the pro's socket join this private room so messages are scoped to the pair
    if (proMeta && proMeta.socketId) {
      const proSocket = io.sockets.sockets.get(proMeta.socketId);
      try {
        proSocket?.join(roomId);
      } catch (err) {
        console.warn("Could not add pro socket to private room:", err?.message || err);
      }
      // Notify the pro directly
      proSocket?.emit("room:user-joined", { userId, userName, roomId, conversationId });
    }

    // Also notify the user socket so it can track the room and conversation if needed
    socket.emit("room:user-joined", { userId, userName, roomId, conversationId });

    // System message in the room
    io.to(roomId).emit("room:message", {
      id: `sys-${Date.now()}`,
      sender: "system",
      senderName: "System",
      text: `${userName} has joined the chat.`,
      timestamp: Date.now(),
    });

    console.log(`User ${userName} joined private room ${roomId}`);
  });

  // User leaves a pro's room
  socket.on("user:leave-room", ({ proId, userId, userName }) => {
    const roomId = `pro:${proId}:user:${userId}`;
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

    // If pro was joined to this private room, remove pro's socket from it
    const proMeta = onlinePros.get(proId);
    if (proMeta && proMeta.socketId) {
      const proSocket = io.sockets.sockets.get(proMeta.socketId);
      try {
        proSocket?.leave(roomId);
      } catch (err) {
        console.warn("Could not remove pro socket from private room:", err?.message || err);
      }
    }
  });

  // Any participant sends a message
  socket.on("message:send", ({ proId, senderId, senderName, senderRole, text, targetUserId = null }) => {
    // Determine the correct private room.
    let roomId = `pro:${proId}`; // fallback to old behavior
    if (senderRole === "user") {
      roomId = `pro:${proId}:user:${senderId}`;
    } else if (senderRole === "professional" && targetUserId) {
      roomId = `pro:${proId}:user:${targetUserId}`;
    }

    const message = {
      id: `msg-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      sender: senderRole,
      senderName,
      text,
      timestamp: Date.now(),
      senderId: senderId || null,
      targetUserId: targetUserId || null,
    };

    io.to(roomId).emit("room:message", message);

    // Optionally persist message into conversation_messages if a conversation exists
    (async () => {
      try {
        // Extract userId from roomId when possible
        const parts = roomId.split(":");
        const maybeUserId = parts.length >= 4 ? parts[3] : null;
        if (maybeUserId) {
          // find conversation between professional and user
          const participantIds = [maybeUserId, proId];
          const conv = await conversationsCollection.findOne({
            isGroup: false,
            $and: [
              { "participants.userId": participantIds[0] },
              { "participants.userId": participantIds[1] },
            ],
          });
          if (conv) {
            await conversationMessagesCollection.insertOne({
              conversationId: conv._id,
              senderId: senderId,
              text,
              createdAt: new Date(),
            });
            await conversationsCollection.updateOne({ _id: conv._id }, { $set: { lastMessage: { senderId, text, createdAt: new Date() }, updatedAt: new Date() } });
          }
        }
      } catch (err) {
        console.warn("Failed to persist socket message:", err?.message || err);
      }
    })();
  });

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

async function getOrCreateDirectConversation(proId, userId, proName, userName) {
  const participantIds = [proId, userId];
  const existing = await conversationsCollection.findOne({
    isGroup: false,
    $and: [
      { "participants.userId": participantIds[0] },
      { "participants.userId": participantIds[1] },
    ],
  });
  if (existing) return existing;

  const now = new Date();
  const conversation = {
    type: "expert-user",
    participants: [
      { userId: proId, role: "professional", name: proName },
      { userId, role: "user", name: userName },
    ],
    title: `Chat with ${userName}`,
    isGroup: false,
    aiAssistant: null,
    createdAt: now,
    updatedAt: now,
    lastMessage: null,
    memory: false,
  };
  const result = await conversationsCollection.insertOne(conversation);
  conversation._id = result.insertedId;
  return conversation;
}

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

    // If a display name/username was provided, ensure it's unique (case-insensitive)
    if (name && typeof name === "string") {
      const escaped = name.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const nameExists = await collection.findOne({ name: { $regex: `^${escaped}$`, $options: "i" } });
      if (nameExists) {
        return {
          success: false,
          statusCode: 409,
          message: "Username already taken. Please choose another name.",
        };
      }
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

  if (user.deleted) {
    throw new Error("This account has been deleted. Restore it before signing in.");
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

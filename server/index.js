import express from "express";
import dotenv from "dotenv";
import {
  connectToDatabase,
  getDb,
  getCollections,
  getUsersCollection,
  getUserHealthCollection,
} from "./db.js";

const app = express();
dotenv.config();

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
      "MongoDB connection failed: DNS could not resolve the Atlas hostname. Check MONGODB_URI cluster host and internet/DNS settings.",
    );
  } else {
    console.error("MongoDB connection failed:", error.message);
  }
}

app.use(express.json());

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

app.post("/register", async (req, res) => {
  try {
    const result = await registerUser(req.body, usersCollection);
    return res.status(201).json(result);
  } catch (error) {
    if (
      error?.message === "EMAIL_REQUIRED" ||
      error?.message === "PASSWORD_REQUIRED"
    ) {
      return res
        .status(400)
        .json({ message: "Email and password are required." });
    }

    if (error?.message === "USER_ALREADY_EXISTS") {
      return res
        .status(409)
        .json({ message: "A user with that email already exists." });
    }

    if (error?.message === "DB_NOT_READY") {
      return res.status(503).json({ message: "Database is not connected." });
    }

    console.error("Register failed:", error);
    return res.status(500).json({ message: "Unable to register user." });
  }
});

app.post("/login", async (req, res) => {
  await signInUser(req.body, usersCollection);
  res.status(501).json({ message: "signInUser not implemented yet" });
});

app.get("/user-health/today", async (req, res) => {
  await getTodayUserMood(req.query, userHealthCollection);
  res.status(501).json({ message: "getTodayUserMood not implemented yet" });
});

app.post("/user-health/today", async (req, res) => {
  await saveTodayUserMood(req.body, userHealthCollection);
  res.status(501).json({ message: "saveTodayUserMood not implemented yet" });
});

// Implement creating a new user document in the users collection.
async function registerUser(payload, collection) {
  if (!collection) {
    throw new Error("DB_NOT_READY");
  }

  const email = payload?.email?.trim().toLowerCase();
  const password = payload?.password;

  if (!email) {
    throw new Error("EMAIL_REQUIRED");
  }

  if (!password) {
    throw new Error("PASSWORD_REQUIRED");
  }

  const existingUser = await collection.findOne({ email });
  if (existingUser) {
    throw new Error("USER_ALREADY_EXISTS");
  }

  const createdAt = new Date();
  const userDocument = {
    email,
    password,
    createdAt,
    updatedAt: createdAt,
  };

  const insertResult = await collection.insertOne(userDocument);

  return {
    message: "User registered successfully.",
    user: {
      id: insertResult.insertedId,
      email,
      createdAt,
    },
  };
}

// Implement authenticating a user from the users collection on sign in.
async function signInUser() {}

// Implement reading today's mood entry for the signed-in user from user_health.
async function getTodayUserMood() {}

// Implement upserting today's mood entry for the signed-in user into user_health.
async function saveTodayUserMood() {}

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

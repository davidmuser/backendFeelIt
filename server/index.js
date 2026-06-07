import express from "express";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import validator from "validator";
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
    const { statusCode, success, message, user } = result;

    return res.status(statusCode).json({
      success,
      message,
      ...(user && { user }),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "An unexpected error occurred on the server.",
    });
  }
});

app.post("/login", async (req, res) => {
  try {
    const user = await signInUser(req.body, usersCollection);
    return res.status(200).json({
      success: true,
      message: "Signed in successfully.",
      user,
    });
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: error.message || "Invalid email or password.",
    });
  }
});

app.get("/user-health/today", async (req, res) => {
  await getTodayUserMood(req.query, userHealthCollection);
  res.status(501).json({ message: "getTodayUserMood not implemented yet" });
});

app.post("/user-health/today", async (req, res) => {
  await saveTodayUserMood(req.body, userHealthCollection);
  res.status(501).json({ message: "saveTodayUserMood not implemented yet" });
});

async function registerUser(body, collection) {
  if (!collection) {
    return {
      success: false,
      statusCode: 500,
      message: "Database collection is not initialized.",
    };
  }

  const { email, password, name } = body;

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
      },
    };
  } catch (error) {
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
  };
}

// Implement reading today's mood entry for the signed-in user from user_health.
async function getTodayUserMood() {}

// Implement upserting today's mood entry for the signed-in user into user_health.
async function saveTodayUserMood() {}

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

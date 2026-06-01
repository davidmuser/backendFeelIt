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
  await registerUser(req.body, usersCollection);
  res.status(501).json({ message: "registerUser not implemented yet" });
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

const express = require('express');
const bcrypt = require('bcryptjs'); // Ensure npm install bcryptjs is run

// const app = express();
// app.use(express.json());// Allows Express to read JSON body requests

// This represents your MongoDB database collection instance
// let usersCollection;


/**
 * 1. NEW REGISTER USER FUNCTION (Meets all new requirements)
 */
async function registerUser(body, collection) {
  if (!collection) {
    return {
      success: false,
      statusCode: 500,
      message: "Database collection is not initialized."
    };
  }

  const { email, password, name } = body;

  // Validate: Presence check
  if (!email || !password) {
    return {
      success: false,
      statusCode: 400,
      message: "Email and password are required."
    };
  }

  // Normalize email (trim spaces and convert to lowercase)
  const normalizedEmail = email.trim().toLowerCase();

  // Validate: Email format check
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(normalizedEmail)) {
    return {
      success: false,
      statusCode: 400,
      message: "Invalid email format."
    };
  }

  // Validate: Password length check (min 8 characters)
  if (password.length < 8) {
    return {
      success: false,
      statusCode: 400,
      message: "Password must be at least 8 characters long."
    };
  }

  try {
    // Check if email already exists
    const existingUser = await collection.findOne({ email: normalizedEmail });
    if (existingUser) {
      return {
        success: false,
        statusCode: 409,
        message: "User with this email already exists."
      };
    }

    // Hash password before saving
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Prepare database document (uses passwordHash)
    const newUser = {
      email: normalizedEmail,
      passwordHash: hashedPassword,
      name: name || null,
      createdAt: new Date()
    };

    // Insert into MongoDB
    const result = await collection.insertOne(newUser);
    
    // Return custom structured object
    return {
      success: true,
      statusCode: 201,
      message: "User registered successfully.",
      user: {
        _id: result.insertedId,
        email: newUser.email,
        name: newUser.name
      }
    };

  } catch (error) {
    return {
      success: false,
      statusCode: 500,
      message: "An internal server error occurred during registration."
    };
  }
}


/**
 * 2. YOUR ORIGINAL SIGN IN USER FUNCTION
 */
async function signInUser(credentials, collection) {
  const { email, password } = credentials;

  if (!email || !password) {
    throw new Error("Email and password are required.");
  }

  if (!collection) {
    throw new Error("Users collection is not initialized.");
  }

  // Find user by email (using normalized email lookup)
  const user = await collection.findOne({ email: email.toLowerCase() });
  if (!user) {
    throw new Error("Invalid email or password.");
  }

  // Note: Updated field from user.password to user.passwordHash to align with your new schema
  const isPasswordValid = await bcrypt.compare(password, user.passwordHash || user.password);
  if (!isPasswordValid) {
    throw new Error("Invalid email or password.");
  }

  return {
    _id: user._id,
    email: user.email,
    name: user.name,
  };
}


/**
 * 3. NEW POST /REGISTER ROUTE (With try/catch and required response codes)
 */
app.post('/register', async (req, res) => {
  try {
    // Pass request body and your DB collection to the helper function
    const result = await registerUser(req.body, usersCollection);

    // Extract the status code and standard output payload
    const { statusCode, success, message, user } = result;

    // Send HTTP status code and response payload consistently
    return res.status(statusCode).json({
      success,
      message,
      ...(user && { user }) // Only adds the user object to the response if it exists
    });

  } catch (error) {
    // Top-level catch block for unexpected route exceptions
    return res.status(500).json({
      success: false,
      message: "An unexpected error occurred on the server."
    });
  }
});



// Implement authenticating a user from the users collection on sign in.

async function signInUser(credentials, collection) {
  const { email, password } = credentials;

  if (!email || !password) {
    throw new Error("Email and password are required.");
  }

  if (!collection) {
    throw new Error("Users collection is not initialized.");
  }

  // Find user by email in MongoDB
  const user = await collection.findOne({ email: email.toLowerCase() });
  if (!user) {
    throw new Error("Invalid email or password.");
  }

  // Compare incoming password with hashed password in database (requires npm install bcrypt)
  const isPasswordValid = await bcrypt.compare(password, user.password);
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

// src/index.ts

import bcrypt from "bcrypt";
import cors from "cors";
import dotenv from "dotenv";
import express, { Request, Response } from "express";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import User from "./models/User.js"; // your mongoose model

// load .env into process.env
dotenv.config();

// constants

// fill in the MongdoDB URI '' with your own values if needed

// fill in the JWT secret with your own value if needed

// when deployed, these values will be set by the host env
const PORT: number = process.env.PORT ? Number(process.env.PORT) : 3000;
const MONGO_URI: undefined | string = process.env.MONGO_URI || "";
const JWT_SECRET: string = process.env.JWT_SECRET;
const EXPIRATION_TIME: string = process.env.EXPIRATION_TIME;

// .env variables checking
const requiredEnv = {
  MONGO_URI,
  JWT_SECRET,
  EXPIRATION_TIME,
};

for (const [key, value] of Object.entries(requiredEnv)) {
  if (!value) {
    console.error(` ${key} is not set`);
    process.exit(1);
  }
}

// connect to MongoDB
mongoose
  .connect(MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  });

const app = express();

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);
app.use(express.json());

/**
 * POST /register
 */
app.post("/register", async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, password, confirm_password, email } = req.body;

    // basic validation
    if (!username || !password || !confirm_password || !email) {
      res.status(400).json({ message: "All fields are required" });
      return;
    }
    if (password !== confirm_password) {
      res.status(400).json({ message: "Passwords do not match" });
      return;
    }

    // check duplicates
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      res.status(400).json({ message: "Username already taken" });
      return;
    }
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      res.status(400).json({ message: "Email already registered" });
      return;
    }

    // hash & save
    const hashed = await bcrypt.hash(password, 10);
    const newUser = new User({
      username,
      email,
      password: hashed,
    });
    await newUser.save();

    res.status(201).json({ message: "User registered successfully" });
    return;
  } catch (err) {
    console.error(err);
    const message =
      err instanceof Error ? err.message : "An unknown error occurred";
    res.status(500).json({ error: message });
    return;
  }
});

/**
 * POST /login
 */
app.post("/login", async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, password } = req.body;

    // basic validation
    if (!username || !password) {
      res.status(400).json({ message: "Username and password are required" });
      return;
    }

    // find user
    const user = await User.findOne({ username });
    if (!user) {
      res.status(401).json({ message: "Invalid username or password" });
      return;
    }

    // check password
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      res.status(401).json({ message: "Invalid username or password" });
      return;
    }

    // sign JWT
    const token = jwt.sign(
      { id: user.id, username: user.username },
      JWT_SECRET || "default_secret",
      // set the expiration time to 1 hour (adjust if needed)
      { expiresIn: EXPIRATION_TIME },
    );

    res.status(200).json({ message: "Login successful", token });
    return;
  } catch (err) {
    console.error(err);
    const message =
      err instanceof Error ? err.message : "An unknown error occurred";
    res.status(500).json({ error: message });
    return;
  }
});

//PUT
//Update User
app.put("/update", async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, email, password, confirm_password } = req.body;

    if (!username) {
      res.status(400).json({ message: "Username is required" });
      return;
    }

    if (!email && !password) {
      res.status(400).json({ message: "Email or password must be provided" });
      return;
    }

    const user = await User.findOne({ username });
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    if (password) {
      if (!confirm_password || password !== confirm_password) {
        res.status(400).json({ message: "Passwords do not match or missing" });
        return;
      }

      user.password = await bcrypt.hash(password, 10);
    }

    await user.save();
    res.status(200).json({ message: "User updated successfully", user });
  } catch (err) {
    console.error(err);
    const message = err instanceof Error ? err.message : "Unknown error";
    res.status(500).json({ error: message });
  }
});

app.delete("/delete/:id", async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const deletedUser = await User.findByIdAndDelete(id);
    if (!deletedUser) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    res.status(200).json({ message: "User deleted successfully", user: deletedUser });
  } catch (err) {
    console.error(err);
    const message = err instanceof Error ? err.message : "Unknown error";
    res.status(500).json({ error: message });
  }
});


// start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

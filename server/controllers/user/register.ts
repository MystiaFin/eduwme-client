import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../../models/User.ts";
import { z } from "zod";
import { registerSchema } from "../../validators/auth.validators.ts";

export const userRegister = async (
  req: Request,
  res: Response,
): Promise<Response | void> => {
  try {
    // validate request body with zod
    const validatedData = registerSchema.parse(req.body);
    const { username, password, confirm_password, email } = validatedData;

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
      dateCreated: new Date(),
      courseBatchesProgress: [],
      dateLastLogin: new Date(),
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
};

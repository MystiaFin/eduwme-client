import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../../models/User.ts";
import { loginSchema } from "../../validators/auth.validators.ts";

const JWT_SECRET = process.env.JWT_SECRET || "default_secret";
const EXPIRATION_TIME = process.env.JWT_EXPIRES_IN || "1d";

export const userLogin = async (
  req: Request,
  res: Response,
): Promise<Response> => {
  try {
    const { username, password } = loginSchema.parse(req.body);

    const user = await User.findOne({ username }).select("+password");
    if (!user) {
      res.status(401).json({ message: "Invalid username or password" });
      return;
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      res.status(401).json({ message: "Invalid username or password" });
      return;
    }

    const token = jwt.sign(
      { id: user.id, username: user.username },
      JWT_SECRET,
      { expiresIn: EXPIRATION_TIME },
    );

    res.status(200).json({ message: "Login successful", token });
  } catch (err) {
    console.error(err);
    const message =
      err instanceof Error ? err.message : "An unknown error occurred";
    res.status(500).json({ error: message });
  }
};

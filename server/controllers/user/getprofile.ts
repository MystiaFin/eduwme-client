import { Request, Response } from "express";
import User from "../../models/User.ts";

export const getUserById = async (
  req: Request,
  res: Response,
): Promise<Response | void> => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res
      .status(200)
      .json({ message: "Profile retrieved successfully", user });
  } catch (err) {
    console.error(err);
    const message =
      err instanceof Error ? err.message : "An unknown error occurred";
    return res.status(500).json({ error: message });
  }
};

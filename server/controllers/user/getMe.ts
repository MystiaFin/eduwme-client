import { Request, Response } from "express";
import User from "../../models/User.js";

export const getMe = async (req: Request, res: Response): Promise<void> => {
  const userId = req.id;

  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  try {
    const user = await User.findById(userId).select("-password -__v");

    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    res.status(200).json(user);
  } catch (error) {
    console.error("Error in userGetMe:", error);
    res.status(500).json({ error: "Failed to retrieve user" });
  }
};

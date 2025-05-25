import { Request, Response } from "express";
import User from "../../models/User.js";

export const leaderboard = async (
  req: Request,
  res: Response,
): Promise<Response | void> => {
  try {
    const leaderboard = await User.find().sort({ xp: -1 }).limit(10);
    res
      .status(200)
      .json({ message: "Leaderboard retrieved successfully", leaderboard });
    return;
  } catch (err) {
    console.error(err);
    const message =
      err instanceof Error ? err.message : "An unknown error occurred";
    res.status(500).json({ error: message });
    return;
  }
};

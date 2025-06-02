import { Request, Response } from "express";

export const userLogout = async (req: Request, res: Response): Promise<void> => {
  try {
    // Clear the JWT cookie
    res.clearCookie("token");
    res.status(200).json({ message: "Logout successful" });
  } catch (err) {
    console.error(err);
    const message = err instanceof Error ? err.message : "An unknown error occurred";
    res.status(500).json({ error: message });
  }
};

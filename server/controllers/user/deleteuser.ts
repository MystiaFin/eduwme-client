import bcrypt from "bcrypt";
import { Request, Response } from "express";
import User from "../../models/User.ts";

export const deleteUser = async (
    req: Request,
    res: Response
): Promise<Response> => {
    try {
    const { email, password} = req.body;

    if (!email || !password) {
        return res
            .status(400)
            .json({ message: "Email and password are required" });
    }

    // Cari user berdasarkan email atau ID
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
        return res.status(401).json({ message: "Incorrect password" });
    }

    await User.deleteOne();

    return res.status(200).json({ message: "User deleted successfully" });
    } catch (err) {
    console.error("Delete user error:", err);
    const message =
        err instanceof Error ? err.message : "An unknown error occurred";
    return res.status(500).json({ error: message });
  }
};

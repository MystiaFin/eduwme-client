import { Request, Response } from "express";
import User from "../../models/User.js";

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

    // Convert user object to a plain object
    const userObject = user.toObject();
    
    // Create a new response object with modified profilePicture
    const responseUser = {
      ...userObject,
      profilePicture: userObject.profilePicture && userObject.profilePicture.data 
        ? `data:${userObject.profilePicture.contentType};base64,${userObject.profilePicture.data.toString('base64')}`
        : null
    };

    return res
      .status(200)
      .json({ message: "Profile retrieved successfully", user: responseUser });
  } catch (err) {
    console.error(err);
    const message =
      err instanceof Error ? err.message : "An unknown error occurred";
    return res.status(500).json({ error: message });
  }
};
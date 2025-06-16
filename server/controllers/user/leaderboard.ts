import { Request, Response } from "express";
import User from "../../models/User";

export const leaderboard = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    // Get the top users by XP
    const users = await User.find({})
      .select("username nickname xp level gems dateLastLogin profilePicture")
      .sort({ xp: -1 })
      .limit(50); // Limit to top 50 users

    // Convert the binary profile pictures to base64 strings
    const leaderboard = users.map(user => {
      const userObj = user.toObject();
      
      // Create a new object with all properties except profilePicture
      const transformedUser = {
        username: userObj.username,
        nickname: userObj.nickname,
        xp: userObj.xp,
        level: userObj.level,
        gems: userObj.gems,
        // Convert binary profile picture data to base64 string
        profilePicture: userObj.profilePicture && userObj.profilePicture.data
          ? `data:${userObj.profilePicture.contentType};base64,${userObj.profilePicture.data.toString('base64')}`
          : null
      };

      return transformedUser;
    });

    res.status(200).json({
      message: "Leaderboard retrieved successfully",
      leaderboard
    });
    return;
  } catch (err) {
    console.error(err);
    const message = err instanceof Error ? err.message : "An unknown error occurred";
    res.status(500).json({ error: message });
    return;
  }
};
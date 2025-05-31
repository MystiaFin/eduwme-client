import { Request, Response } from "express";
import User from "../../models/User.ts";
import { profileSchema } from "../../validators/profile.validators.ts";

export const updateProfile = async (
  req: Request,
  res: Response,
): Promise<Response | void> => {
  try {
    // validate request body with zod
    const validatedData = profileSchema.parse(req.body);
    const { userId, nickname, biodata, profilePicture } = validatedData;

    // find user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // update user profile
    
    if (nickname !== undefined)  user.nickname = nickname;
    if (biodata !== undefined)  user.biodata = biodata;
    if (profilePicture !== undefined) user.profilePicture = profilePicture;
    
    user.dateUpdated = new Date();

    await user.save();

    return res
      .status(200)
      .json({ message: "Profile created successfully", user });
  } catch (err) {
    console.error(err);
    const message =
      err instanceof Error ? err.message : "An unknown error occurred";
    return res.status(500).json({ error: message });
  }
};

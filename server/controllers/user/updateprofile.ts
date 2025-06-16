import { Request, Response } from "express";
import User from "../../models/User";
import { profileSchema } from "../../validators/profile.validators";
import sharp from "sharp"; // Add this import

export const updateProfile = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    // validate request body with zod
    const validatedData = profileSchema.parse(req.body);
    const { userId, nickname, biodata, profilePicture } = validatedData;

    // find user
    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    // update user profile
    if (nickname !== undefined) user.nickname = nickname;
    if (biodata !== undefined) user.biodata = biodata;
    
    // Handle profile picture if provided
    if (profilePicture) {
      try {
        // Extract the base64 data and content type
        const matches = profilePicture.match(/^data:([A-Za-z-+/]+);base64,(.+)$/);
        
        if (matches && matches.length === 3) {
          const base64Data = matches[2];
          const buffer = Buffer.from(base64Data, 'base64');
          
          // Resize and optimize the image using sharp
          const resizedImageBuffer = await sharp(buffer)
            .resize(400, 400, { 
              fit: 'cover',
              withoutEnlargement: true
            })
            .jpeg({ quality: 80 })
            .toBuffer();
          
          // Store the optimized binary data and content type
          user.profilePicture = {
            data: resizedImageBuffer,
            contentType: 'image/jpeg' // Convert all to JPEG for consistency
          };
        }
      } catch (error) {
        console.error("Error processing image:", error);
        res.status(400).json({ error: "Invalid image data" });
        return;
      }
    }
    
    user.dateUpdated = new Date();
    await user.save();
    
    res
      .status(200)
      .json({ 
        message: "Profile updated successfully", 
        user: {
          ...user.toObject(),
          profilePicture: user.profilePicture && user.profilePicture.data ? 
            `data:${user.profilePicture.contentType};base64,${user.profilePicture.data.toString('base64')}` : 
            null
        }
      });
      return;
  } catch (err) {
    console.error(err);
    const message =
      err instanceof Error ? err.message : "An unknown error occurred";
    res.status(500).json({ error: message });
    return;
  }
};
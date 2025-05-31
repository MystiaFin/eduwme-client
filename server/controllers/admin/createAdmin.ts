import { Request, Response } from 'express';
import User from '../../models/User';
import bcrypt from 'bcrypt';
import { registerSchema } from '../../validators/auth.validators';

export const createAdmin = async (req: Request, res: Response): Promise<void> => {
  try {
    // Extract admin details from request body
    const validatedData = registerSchema.parse(req.body);
    const { username, password, email } = validatedData;

    // Basic validation
    if (!username || !password || !email) {
      res.status(400).json({ message: "All fields are required" });
      return;
    
    }

    const existingAdmin = await User.findOne({ email });
    if (existingAdmin) {
      res.status(409).json({ message: "Admin already exists" });
        return;
    }

    const hashedPassword = await bcrypt.hash(password, 10); 

    const newAdmin = new User({
      username,
      password: hashedPassword, 
      email,
      role: 'admin',
      dateCreated: new Date(),
      dateLastLogin: new Date(),
    });

    await newAdmin.save();

    res.status(201).json({ message: "Admin created successfully", admin: newAdmin });
    return;
  } catch (err) {
    console.error(err);
    const message = err instanceof Error ? err.message : "An unknown error occurred";
    res.status(500).json({ error: message });
    return;
  }
}  
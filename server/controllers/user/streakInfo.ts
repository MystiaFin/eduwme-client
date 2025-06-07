import {Request, Response} from 'express';
import User from '../../models/User.js';

export const streakInfo = async (req: Request, res: Response): Promise<void | Promise<unknown>> => {
     try {
    const userId = req.user?.id;
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    return res.json({
      streak: user.streak || 0,
      lastLoginDate: user.lastLoginDate || null,
      currentDate: new Date(),
      streakUpdated: false
    });
  } catch (error) {
    console.error('Error getting streak info:', error);
    return res.status(500).json({ message: 'Server error' });
  }
}
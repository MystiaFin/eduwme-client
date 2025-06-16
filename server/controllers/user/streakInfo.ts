import {Request, Response} from 'express';
import User from '../../models/User';

export const streakInfo = async (req: Request, res: Response): Promise<void> => {
     try {
    const userId = req.user?.id;
    const user = await User.findById(userId);
    
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    res.json({
      streak: user.streak || 0,
      lastLoginDate: user.lastLoginDate || null,
      currentDate: new Date(),
      streakUpdated: false
    });
    return;
  } catch (error) {
    console.error('Error getting streak info:', error);
    res.status(500).json({ message: 'Server error' });
    return;
  }
}
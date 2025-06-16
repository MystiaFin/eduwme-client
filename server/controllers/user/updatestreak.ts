import {Request, Response} from 'express';
import User from '../../models/User';

export const updateStreak = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const user = await User.findById(userId);
    
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }
    
    const currentDate = new Date();
    const lastLoginDate = user.lastLoginDate ? new Date(user.lastLoginDate) : null;
    
    // Initialize streak if it doesn't exist
    if (!user.streak) {
      user.streak = 1;
      user.lastLoginDate = currentDate;
      await user.save();
      
      res.json({
        streak: 1,
        lastLoginDate: user.lastLoginDate,
        currentDate: currentDate,
        streakUpdated: true
      });
      return;
    }
    
    // If no previous login, set streak to 1
    if (!lastLoginDate) {
      user.streak = 1;
      user.lastLoginDate = currentDate;
      await user.save();
      
      res.json({
        streak: 1,
        lastLoginDate: user.lastLoginDate,
        currentDate: currentDate,
        streakUpdated: true
      });
      return;
    }
    
    // Check if last login was yesterday (streak continues)
    const isYesterday = (
      lastLoginDate.getDate() === currentDate.getDate() - 1 &&
      lastLoginDate.getMonth() === currentDate.getMonth() &&
      lastLoginDate.getFullYear() === currentDate.getFullYear()
    );
    
    // Check if last login was today (streak stays the same)
    const isToday = (
      lastLoginDate.getDate() === currentDate.getDate() &&
      lastLoginDate.getMonth() === currentDate.getMonth() &&
      lastLoginDate.getFullYear() === currentDate.getFullYear()
    );
    
    let streakUpdated = false;
    
    if (isYesterday) {
      // Increment streak for consecutive days
      user.streak += 1;
      user.lastLoginDate = currentDate;
      streakUpdated = true;
    } else if (isToday) {
      // Already logged in today, don't update streak
      streakUpdated = false;
    } else {
      // Streak broken, reset to 1
      user.streak = 1;
      user.lastLoginDate = currentDate;
      streakUpdated = true;
    }
    
    await user.save();
    
    res.json({
      streak: user.streak,
      lastLoginDate: user.lastLoginDate,
      currentDate: currentDate,
      streakUpdated
    });
    return;
  } catch (error) {
    console.error('Error updating streak:', error);
    res.status(500).json({ message: 'Server error' });
    return;
  }
}
import {Request, Response} from 'express';
import { purchaseItemSchema } from '../../validators/shopItem.validators';
import User from '../../models/User';
import ShopItem from '../../models/ShopItem';

export const purchaseItem = async (req: Request, res: Response): Promise<void> => {
    try {
      const validatedData = purchaseItemSchema.parse(req.body);
      const { userId, itemId } = validatedData;
      
      // Find user
      const user = await User.findById(userId);
      if (!user) {
        res.status(404).json({ message: 'User not found' });
        return;
      }
      
      // Find shop item
      const shopItem = await ShopItem.findOne({ itemId, isAvailable: true });
      if (!shopItem) {
        res.status(404).json({ message: 'Item not found or not available' });
        return;
      }
      
      // Check if user already owns this item
      const alreadyOwns = user.inventory && user.inventory.some(item => item.itemId === itemId);
      if (alreadyOwns) {
        res.status(400).json({ message: 'You already own this item' });
        return;
      }
      
      // Check if user has enough gems
      if (user.gems < shopItem.price) {
        res.status(400).json({ message: 'Not enough gems to purchase this item' });
        return;
      }
      
      // Deduct gems and add item to inventory
      user.gems -= shopItem.price;
      
      // Initialize inventory array if it doesn't exist
      if (!user.inventory || user.inventory.length === 0) {
      // Create the first inventory item directly
        user.inventory.push({
            itemId: shopItem.itemId,
            dateAcquired: new Date(),
            isEquipped: false,

        });
        } else {
        // Add to existing inventory
        user.inventory.push({
            itemId: shopItem.itemId,
            dateAcquired: new Date(),
            isEquipped: false,
        });
        }

      
      // Save user changes
      await user.save();
      
      res.status(200).json({ 
        message: 'Item purchased successfully',
        item: shopItem,
        remainingGems: user.gems
      });
      return;
    } catch (err) {
      console.error(err);
      const message = err instanceof Error ? err.message : 'An unknown error occurred';
      res.status(500).json({ error: message });
      return;
    }
  }
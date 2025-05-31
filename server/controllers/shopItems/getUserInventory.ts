import { Request, Response } from 'express';
import User from '../../models/User';
import ShopItem from '../../models/ShopItem';


export const getUserInventory = async (req: Request, res: Response): Promise<Response | void> => {
    try {
      const { userId } = req.params;
      
      // Find user
      const user = await User.findById(userId);
      if (!user) {
        res.status(404).json({ message: 'User not found' });
        return;
      }
      
      // If user has no inventory or it's empty
      if (!user.inventory || user.inventory.length === 0) {
        res.status(200).json({ message: 'User has no items', inventory: [] });
        return;
      }
      
      // Get detailed information about each item in the inventory
      const inventoryDetails = await Promise.all(
        user.inventory.map(async (item) => {
          const shopItem = await ShopItem.findOne({ itemId: item.itemId }).lean();
          const filteredItem = shopItem ? {
            itemId: shopItem.itemId,
            name: shopItem.name,
            description: shopItem.description,
            imageUrl: shopItem.imageUrl,
            price: shopItem.price,
            category: shopItem.category,
            isAvailable: shopItem.isAvailable
        } : {name: 'Unknown Item', description: 'Item details not found'};

          return {
            ...item.toObject(),
            details: filteredItem
          };
        })
      );
      
      res.status(200).json({ 
        message: 'User inventory retrieved successfully',
        inventory: inventoryDetails
      });
    } catch (err) {
      console.error(err);
      const message = err instanceof Error ? err.message : 'An unknown error occurred';
      res.status(500).json({ error: message });
    }
  }
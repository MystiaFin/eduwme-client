import { Request, Response } from 'express';
import User from '../../models/User.js';
import ShopItem from '../../models/ShopItem.js';

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
        user.inventory.map(async (item: any) => {
          const shopItem = await ShopItem.findOne({ itemId: item.itemId });
          
          if (!shopItem) {
            return {
              ...item.toObject(),
              details: { name: 'Unknown Item', description: 'Item details not found' }
            };
          }
          
          // Convert item to plain object
          const shopItemObj = shopItem.toObject();
          
          // Convert binary image to base64 if it exists
          let imageUrlStr = null;
          if (shopItemObj.imageUrl && shopItemObj.imageUrl.data) {
            imageUrlStr = `data:${shopItemObj.imageUrl.contentType};base64,${shopItemObj.imageUrl.data.toString('base64')}`;
          }
          
          // Create filtered item with processed image
          const filteredItem = {
            itemId: shopItemObj.itemId,
            name: shopItemObj.name,
            description: shopItemObj.description,
            imageUrl: imageUrlStr,
            price: shopItemObj.price,
            category: shopItemObj.category,
            isAvailable: shopItemObj.isAvailable
          };

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
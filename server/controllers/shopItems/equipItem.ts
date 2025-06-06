import { Request, Response } from 'express';
import User from '../../models/User.js';
import ShopItem from '../../models/ShopItem.js';
import { equipItemSchema } from '../../validators/shopItem.validators.js';

export const equipItem = async (req: Request, res: Response): Promise<void | Response> => {
    try {
      const validatedData = equipItemSchema.parse(req.body);
      const { userId, itemId, equip } = validatedData;
      
      // Find user
      const user = await User.findById(userId);
      if (!user) {
        res.status(404).json({ message: 'User not found' });
        return;
      }
      
      // Check if user owns this item
      if (!user.inventory) {
        res.status(404).json({ message: `User has no item with itemId:${itemId} in inventory` });
        return;
      }
      
      const itemIndex = user.inventory.findIndex(item => item.itemId === itemId);
      if (itemIndex === -1) {
        res.status(404).json({ message: 'Item not found in user inventory' });
        return;
      }
      
      // Get item details to know its category
      const shopItem = await ShopItem.findOne({ itemId });
      if (!shopItem) {
        res.status(404).json({ message: 'Shop item details not found' });
        return;
      }
      
      // If equipping, unequip any other items of the same category
      if (equip) {
        for (let i = 0; i < user.inventory.length; i++) {
          if (i !== itemIndex) {
            const otherItem = await ShopItem.findOne({ itemId: user.inventory[i].itemId });
            if (otherItem && otherItem.category === shopItem.category && user.inventory[i].isEquipped) {
              user.inventory[i].isEquipped = false;
            }
          }
        }
      }
      
      // Update the equipped status
      user.inventory[itemIndex].isEquipped = equip;
      
      // Save changes
      user.markModified('inventory');
      await user.save();
      
      // Get detailed item info for response
      const shopItemObj = shopItem.toObject();

      // Create a new object with transformed imageUrl
      const transformedShopItem = {
        ...shopItemObj,
        imageUrl: shopItemObj.imageUrl && shopItemObj.imageUrl.data 
          ? `data:${shopItemObj.imageUrl.contentType};base64,${shopItemObj.imageUrl.data.toString('base64')}`
          : null
      };

      
      res.status(200).json({ 
        message: equip ? 'Item equipped successfully' : 'Item unequipped successfully',
        inventoryItem: {
          ...user.inventory[itemIndex].toObject(),
          details: transformedShopItem
        }
      });
    } catch (err) {
      console.error(err);
      const message = err instanceof Error ? err.message : 'An unknown error occurred';
      res.status(500).json({ error: message });
    }
}
import { Request, Response } from 'express';
import { createShopItemSchema } from '../../validators/shopItem.validators';
import ShopItem from '../../models/ShopItem';

export const createShopItem = async (req: Request, res: Response): Promise<Response | void> => {
    try {
      const validatedData = createShopItemSchema.parse(req.body);
      const { itemId, name, description, imageUrl, price, category, isAvailable } = validatedData;
      
      // Check if item already exists
      const existingItem = await ShopItem.findOne({ itemId });
      if (existingItem) {
        res.status(400).json({ message: 'Item with this ID already exists' });
        return;
      }
      
      // Create new shop item
      const shopItem = new ShopItem({
        itemId,
        name,
        description,
        imageUrl,
        price,
        category,
        isAvailable: isAvailable !== undefined ? isAvailable : true,
        dateCreated: new Date()
      });
      
      await shopItem.save();
      
      res.status(201).json({ message: 'Shop item created successfully', shopItem });
    } catch (err) {
      console.error(err);
      const message = err instanceof Error ? err.message : 'An unknown error occurred';
      res.status(500).json({ error: message });
    }

}
import {Request, Response} from 'express';
import ShopItem from '../../models/ShopItem';

  
export const getShopItems =  async (req: Request, res: Response): Promise<void> => {
    try {
      // Filter only available items unless an admin query parameter is provided
      const isAdmin = req.query.admin === 'true';
      const filter: any = isAdmin ? {} : { isAvailable: true };
      
      // Optional category filter
      if (req.query.category) {
        filter.category = req.query.category;
      }
      
      const shopItems = await ShopItem.find(filter).sort({ price: 1 });
      
      if (!shopItems || shopItems.length === 0) {
        res.status(404).json({ message: 'No shop items found' });
        return;
      }

      const formattedShopItems = shopItems.map(item => ({
        itemId: item.itemId,
        name: item.name,
        description: item.description,
        imageUrl: item.imageUrl,
        price: item.price,
        category: item.category,
        isAvailable: item.isAvailable,
      }));
      
      res.status(200).json({ message: 'Shop items retrieved successfully', shopItems: formattedShopItems });
    } catch (err) {
      console.error(err);
      const message = err instanceof Error ? err.message : 'An unknown error occurred';
      res.status(500).json({ error: message });
    }
}

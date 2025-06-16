import { Request, Response } from 'express';
import { createShopItemSchema } from '../../validators/shopItem.validators';
import ShopItem from '../../models/ShopItem';
import sharp from 'sharp';

export const createShopItem = async (req: Request, res: Response): Promise<void> => {
    try {
      const validatedData = createShopItemSchema.parse(req.body);
      const { itemId, name, description, imageUrl, price, category, isAvailable } = validatedData;
      
      // Check if item already exists
      const existingItem = await ShopItem.findOne({ itemId });
      if (existingItem) {
        res.status(400).json({ message: 'Item with this ID already exists' });
        return;
      }
      
      // Process image if provided
      let imageData: { data: Buffer; contentType: string } | null = null;
      if (imageUrl) {
        try {
          // Extract the base64 data and content type
          const matches = imageUrl.match(/^data:([A-Za-z-+/]+);base64,(.+)$/);
          
          if (matches && matches.length === 3) {
            const base64Data = matches[2];
            const buffer = Buffer.from(base64Data, 'base64');
            
            // Resize and optimize the image using sharp
            const resizedImageBuffer = await sharp(buffer)
              .resize(300, 300, { 
                fit: 'contain',
                background: { r: 0, g: 0, b: 0, alpha: 0 } // Transparent background
              })
              .png({ quality: 90 })
              .toBuffer();
            
            // Prepare image data
            imageData = {
              data: resizedImageBuffer,
              contentType: 'image/png'
            };
          }
        } catch (error) {
          console.error("Error processing image:", error);

          res.status(400).json({ error: "Invalid image data" });
          return; 
        }
      }
      
      // Create new shop item
      const shopItem = new ShopItem({
        itemId,
        name,
        description,
        imageUrl: imageData,
        price,
        category,
        isAvailable: isAvailable !== undefined ? isAvailable : true,
        dateCreated: new Date()
      });
      
      await shopItem.save();
      
      // Convert binary image back to base64 for response
      const shopItemObj = shopItem.toObject();

      // Create a new object with transformed imageUrl
      const transformedShopItem = {
        ...shopItemObj,
        imageUrl: shopItemObj.imageUrl && shopItemObj.imageUrl.data 
          ? `data:${shopItemObj.imageUrl.contentType};base64,${shopItemObj.imageUrl.data.toString('base64')}`
          : null
      };



      res.status(201).json({ message: 'Shop item created successfully', shopItem: transformedShopItem });
      return;
    } catch (err) {
      console.error(err);
      const message = err instanceof Error ? err.message : 'An unknown error occurred';
      res.status(500).json({ error: message });
      return;
    }
}
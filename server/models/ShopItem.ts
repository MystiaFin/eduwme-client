import mongoose from 'mongoose';

const shopItemSchema = new mongoose.Schema({
  itemId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  description: { type: String, required: true },
  imageUrl: { type: String },
  price: { type: Number, required: true, min: 1 },
  category: { 
    type: String, 
    enum: ['avatar', 'background', 'badge', 'theme', 'powerup'],
    required: true 
  },
  dateCreated: { type: Date, default: Date.now },
  isAvailable: { type: Boolean, default: true },
});

const ShopItem = mongoose.model('ShopItem', shopItemSchema);
export default ShopItem;
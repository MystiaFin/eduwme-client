import { Router } from "express";
import { purchaseItem } from "../controllers/shopItems/purchaseItem.js";
import { getUserInventory } from "../controllers/shopItems/getUserInventory.js";
import { getShopItems } from "../controllers/shopItems/getShopItems.js";
import { equipItem } from "../controllers/shopItems/equipItem.js";
import { isAdmin, isUser } from "../middlewares/middleware.js";
import { createShopItem } from "../controllers/shopItems/createShopItem.js";

const router = Router();

// Shop Item Routes
router.post("/purchaseItem", isUser, purchaseItem);
router.get("/userInventory/:userId", isUser, getUserInventory);
router.put("/equipItem", isUser, equipItem);
router.get("/getShopItems", isUser, getShopItems)

router.post("/createShopItem", isAdmin, createShopItem); 

export default router;
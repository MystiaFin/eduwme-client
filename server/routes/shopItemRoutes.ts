import { Router } from "express";
import { purchaseItem } from "../controllers/shopItems/purchaseItem.ts";
import { getUserInventory } from "../controllers/shopItems/getUserInventory.ts";
import { getShopItems } from "../controllers/shopItems/getShopItems.ts";
import { equipItem } from "../controllers/shopItems/equipItem.ts";
import { isAdmin, isUser } from "../middlewares/middleware.ts";
import { createShopItem } from "../controllers/shopItems/createShopItem.ts";

const router = Router();

// Shop Item Routes
router.post("/purchaseItem", isUser, purchaseItem);
router.get("/userInventory/:userId", isUser, getUserInventory);
router.put("/equipItem", isUser, equipItem);
router.get("/getShopItems", isUser, getShopItems)

router.post("/createShopItem", isAdmin, createShopItem); 

export default router;
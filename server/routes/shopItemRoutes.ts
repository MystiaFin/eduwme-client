import { Router } from "express";
import { purchaseItem } from "../controllers/shopItems/purchaseItem";
import { getUserInventory } from "../controllers/shopItems/getUserInventory";
import { getShopItems } from "../controllers/shopItems/getShopItems";
import { equipItem } from "../controllers/shopItems/equipItem";
import { isAdmin, isUser } from "../middlewares/middleware";
import { createShopItem } from "../controllers/shopItems/createShopItem";

const router = Router();

// Shop Item Routes
router.post("/purchaseItem", isUser, purchaseItem);
router.get("/userInventory/:userId", isUser, getUserInventory);
router.put("/equipItem", isUser, equipItem);
router.get("/getShopItems", isUser, getShopItems)

router.post("/createShopItem", isAdmin, createShopItem); 

export default router;
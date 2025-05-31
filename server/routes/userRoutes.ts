import { Router } from "express";
import { userRegister } from "../controllers/user/register.ts";
import { userLogin } from "../controllers/user/login.ts";
import { updateProfile } from "../controllers/user/updateProfile.ts";
import { getUserById } from "../controllers/user/getprofile.ts";
import { getUsers } from "../controllers/user/getusers.ts";

import { isUser, verifyTokenMiddleware } from "../middlewares/middleware.ts";

const router = Router();

router.post("/register", userRegister);
router.post("/login", userLogin);
router.put("/updateProfile", isUser, updateProfile);
router.get("/getProfile/:userId", isUser, getUserById);
router.get("/getUsers", verifyTokenMiddleware, isUser, getUsers);

export default router;

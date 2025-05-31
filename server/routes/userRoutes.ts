import { Router } from "express";
import { userRegister } from "../controllers/user/register.ts";
import { userLogin } from "../controllers/user/login.ts";
import { updateProfile } from "../controllers/user/updateProfile.ts";
import { getUserById } from "../controllers/user/getprofile.ts";
import { getUsers } from "../controllers/user/getusers.ts";

import { isAdmin, isUser} from "../middlewares/middleware.ts";

const router = Router();

// User Routes
router.post("/register", userRegister);
router.post("/login", userLogin);
router.put("/updateProfile", isUser, updateProfile);
router.get("/getProfile/:userId", isUser, getUserById);

router.get("/getUsers", isAdmin, getUsers);

export default router;

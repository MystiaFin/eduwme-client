import { Router } from "express";
import { userRegister } from "../controllers/user/register.ts";
import { userLogin } from "../controllers/user/login.ts";
import { updateProfile } from "../controllers/user/updateProfile.ts";
import { getUserById } from "../controllers/user/getprofile.ts";
import { getUsers } from "../controllers/user/getusers.ts";
import { getMe } from "../controllers/user/getme.ts";
import { userLogout } from "../controllers/user/logout.ts";

import { isAdmin, isUser } from "../middlewares/middleware.ts";
import rateLimit from "express-rate-limit";

// More strict limiter for authentication
const authLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 10, // 10 login attempts per hour
  message: {
    status: 429,
    message: "Too many login attempts, please try again later.",
  },
});

const router = Router();

// User Routes
router.post("/register", authLimiter, userRegister);
router.post("/login", authLimiter, userLogin);
router.post("/logout", userLogout);
router.put("/updateProfile", isUser, updateProfile);
router.get("/getProfile/:userId", isUser, getUserById);
router.get("/getme", isUser, getMe);
router.get("/getUsers", isAdmin, getUsers);

export default router;

import { Router } from "express";
import { userRegister } from "../controllers/user/register.js";
import { userLogin } from "../controllers/user/login.js";
import { updateProfile } from "../controllers/user/updateprofile.js";
import { getUserById } from "../controllers/user/getprofile.js";
import { getUsers } from "../controllers/user/getusers.js";
import { getMe } from "../controllers/user/getMe.js";
import { userLogout } from "../controllers/user/logout.js";

import { isAdmin, isUser } from "../middlewares/middleware.js";
import rateLimit from "express-rate-limit";
import { updateStreak } from "../controllers/user/updatestreak.js";
import { streakInfo } from "../controllers/user/streakInfo.js";

// More strict limiter for authentication
const authLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 1 minute
  max: 100, // 100 login attempts per 1 minute
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
router.post("/updateStreak", isUser, updateStreak);
router.get("/streakInfo", isUser, streakInfo);

export default router;

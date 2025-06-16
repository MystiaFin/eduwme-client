import { Router } from "express";
import { userRegister } from "../controllers/user/register";
import { userLogin } from "../controllers/user/login";
import { updateProfile } from "../controllers/user/updateprofile";
import { getUserById } from "../controllers/user/getprofile";
import { getUsers } from "../controllers/user/getusers";
import { getMe } from "../controllers/user/getMe";
import { userLogout } from "../controllers/user/logout";

import { isAdmin, isUser } from "../middlewares/middleware";
import rateLimit from "express-rate-limit";
import { updateStreak } from "../controllers/user/updatestreak";
import { streakInfo } from "../controllers/user/streakInfo";
import { leaderboard } from "../controllers/user/leaderboard";

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
router.get("/leaderboard", isUser, leaderboard);
router.post("/updateStreak", isUser, updateStreak);
router.get("/streakInfo", isUser, streakInfo);

export default router;

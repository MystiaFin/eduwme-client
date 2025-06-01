import { Router } from "express";
import { userRegister } from "../controllers/user/register.ts";
import { userLogin } from "../controllers/user/login.ts";
import { updateProfile } from "../controllers/user/updateProfile.ts";
import { getUserById } from "../controllers/user/getprofile.ts";
import { getUsers } from "../controllers/user/getusers.ts";

import { isAdmin, isUser} from "../middlewares/middleware.ts";
import rateLimit from "express-rate-limit";

// More strict limiter for authentication
const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // 5 login attempts per hour
  message: {
    status: 429,
    message: "Too many login attempts, please try again later."
  }
});

const router = Router();

// User Routes
router.post("/register", authLimiter, userRegister);
router.post("/login", authLimiter, userLogin);
router.put("/updateProfile", isUser, updateProfile);
router.get("/getProfile/:userId", isUser, getUserById);

router.get("/getUsers", isAdmin, getUsers);

export default router;

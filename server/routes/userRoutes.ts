import { Router } from "express";
import { userRegister } from "../controllers/user/register.ts";
import { userLogin } from "../controllers/user/login.ts";
import { updateProfile } from "../controllers/user/updateProfile.ts";
import { getUserById } from "../controllers/user/getprofile.ts";
import { verifyTokenMiddleware } from "../middlewares/middleware.ts";

const router = Router();

router.post("/register", userRegister);
router.post("/login", userLogin);
router.put("/updateprofile", updateProfile);
router.get("/getprofile/:userId", getUserById);

export default router;

import { Router } from "express";
import { deleteUser } from "../controllers/user/deleteuser.ts";
import { getUserById } from "../controllers/user/getprofile.ts";
import { getUsers } from "../controllers/user/getusers.ts";
import { userLogin } from "../controllers/user/login.ts";
import { userRegister } from "../controllers/user/register.ts";
import { updateProfile } from "../controllers/user/updateProfile.ts";

import { verifyTokenMiddleware } from "../middlewares/middleware.ts";

const router = Router();

router.post("/register", userRegister);
router.post("/login", userLogin);
router.put("/updateprofile", updateProfile);
router.get("/getprofile/:userId", getUserById);
router.get("/getusers", verifyTokenMiddleware, getUsers);
router.post("/delete", deleteUser);

export default router;

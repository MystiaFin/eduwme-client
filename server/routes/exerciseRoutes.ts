import { Router } from "express";

import { createExercise } from "../controllers/exercise/createExercise.ts";
import { getExerciseById } from "../controllers/exercise/getExerciseById.ts";
import { getExercise } from "../controllers/exercise/getExercise.ts";
import { updateExercise } from "../controllers/exercise/updateExercise.ts";
import { deleteExercise } from "../controllers/exercise/deleteExercise.ts";

import { verifyTokenMiddleware } from "../middlewares/middleware.ts";

const router = Router();

router.post("/createExercise", verifyTokenMiddleware, createExercise);
router.get("/getExercise/:exerciseId", getExerciseById);
router.get("getExercise", getExercise);
router.put("/updateExercise", verifyTokenMiddleware, updateExercise);
router.delete("/deleteExercise", verifyTokenMiddleware, deleteExercise);

export default router;

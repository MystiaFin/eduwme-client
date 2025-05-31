import { Router } from "express";

import { createExercise } from "../controllers/exercise/createExercise.ts";
import { getExerciseById } from "../controllers/exercise/getExerciseById.ts";
import { getExercise } from "../controllers/exercise/getExercise.ts";
import { updateExercise } from "../controllers/exercise/updateExercise.ts";
import { deleteExercise } from "../controllers/exercise/deleteExercise.ts";

import { isAdmin, isUser, verifyTokenMiddleware } from "../middlewares/middleware.ts";

const router = Router();

// Exercises Routes
router.get("/getExercise/:exerciseId", isUser, getExerciseById);
router.get("/getExercise", isUser, getExercise);
router.post("/createExercise", isAdmin, createExercise);
router.put("/updateExercise", isAdmin, updateExercise);
router.delete("/deleteExercise", isAdmin, deleteExercise);

export default router;

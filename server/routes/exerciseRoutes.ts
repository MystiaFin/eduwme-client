import { Router } from "express";

import { createExercise } from "../controllers/exercise/createExercise";
import { getExerciseById } from "../controllers/exercise/getExerciseById";
import { getExercise } from "../controllers/exercise/getExercise";
import { updateExercise } from "../controllers/exercise/updateExercise";
import { deleteExercise } from "../controllers/exercise/deleteExercise";

import { isAdmin, isUser } from "../middlewares/middleware";

const router = Router();

// Exercises Routes
router.get("/getExercise/:exerciseId", isUser, getExerciseById);
router.get("/getExercise", isUser, getExercise);
router.post("/createExercise", isAdmin, createExercise);
router.put("/updateExercise", isAdmin, updateExercise);
router.delete("/deleteExercise", isAdmin, deleteExercise);

export default router;

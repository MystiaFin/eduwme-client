import { Router } from "express";

import { completeExercise } from "../controllers/courses/completeExercise.ts";
import { leaderboard } from "../controllers/courses/leaderboard.ts";

// course batches
import { createCourseBatch } from "../controllers/courses/createCourseBatch.ts";
import { getCourseBatches } from "../controllers/courses/getCourseBatches.ts";
import { getCourseBatchById } from "../controllers/courses/getCourseBatchById.ts";
import { updateCourseBatch } from "../controllers/courses/updateCourseBatch.ts";
import { deleteCourseBatch } from "../controllers/courses/deleteCourseBatch.ts";

// courses
import { getCourses } from "../controllers/courses/getCourses.ts";
import { getCoursesById } from "../controllers/courses/getCoursesById.ts";
import { createCourse } from "../controllers/courses/createCourse.ts";
import { updateCourse } from "../controllers/courses/updateCourse.ts";
import { deleteCourse } from "../controllers/courses/deleteCourse.ts";
// middleware
import { verifyTokenMiddleware } from "../middlewares/middleware.ts";

const router = Router();

router.post(
  "/complete/:userId/:courseBatchId/:courseId/:exerciseId",
  verifyTokenMiddleware,
  completeExercise,
);

router.get("/leaderboard", verifyTokenMiddleware, leaderboard);

router.post("/createCourseBatch", verifyTokenMiddleware, createCourseBatch);
router.get("/getCourseBatches", getCourseBatches);
router.get("/getCourseBatch/:courseBatchId", getCourseBatchById);
router.put("/updateCourseBatch", verifyTokenMiddleware, updateCourseBatch);
router.delete("/deleteCourseBatch", verifyTokenMiddleware, deleteCourseBatch);

router.get("/getCourses", getCourses);
router.get("/getCoursesById/:courseId", verifyTokenMiddleware);
router.post("/createCourse", verifyTokenMiddleware);
router.put("/updateCourse", updateCourse);
router.delete("/deleteCourse", verifyTokenMiddleware, deleteCourse);

export default router;

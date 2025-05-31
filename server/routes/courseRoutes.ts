import { Router } from "express";

import { completeExercise } from "../controllers/courses/completeExercise.ts";

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
import { isAdmin, isUser, } from "../middlewares/middleware.ts";

const router = Router();

router.post(
  "/complete/:userId/:courseBatchId/:courseId/:exerciseId",
  isUser,
  completeExercise,
);

router.get("/getCourseBatches", isUser, getCourseBatches);
router.get("/getCourseBatch/:courseBatchId", isUser, getCourseBatchById);
router.post("/createCourseBatch", isAdmin, createCourseBatch);
router.put("/updateCourseBatch", isAdmin, updateCourseBatch);
router.delete("/deleteCourseBatch", isAdmin, deleteCourseBatch);

router.get("/getCourses", getCourses);
router.get("/getCoursesById/:courseId", isUser, getCoursesById);
router.post("/createCourse", isAdmin, createCourse);
router.put("/updateCourse", isAdmin, updateCourse);
router.delete("/deleteCourse", isAdmin, deleteCourse);

export default router;

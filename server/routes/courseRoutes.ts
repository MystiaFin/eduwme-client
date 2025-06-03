import { Router } from "express";

import { completeExercise } from "../controllers/courses/completeExercise.js";

// course batches
import { createCourseBatch } from "../controllers/courses/createCourseBatch.js";
import { getCourseBatches } from "../controllers/courses/getCourseBatches.js";
import { getCourseBatchById } from "../controllers/courses/getCourseBatchById.js";
import { updateCourseBatch } from "../controllers/courses/updateCourseBatch.js";
import { deleteCourseBatch } from "../controllers/courses/deleteCourseBatch.js";

// courses
import { getCourses } from "../controllers/courses/getCourses.js";
import { getCoursesById } from "../controllers/courses/getCoursesById.js";
import { createCourse } from "../controllers/courses/createCourse.js";
import { updateCourse } from "../controllers/courses/updateCourse.js";
import { deleteCourse } from "../controllers/courses/deleteCourse.js";
// middleware
import { isAdmin, isUser, } from "../middlewares/middleware.js";

const router = Router();

// User Completion of an exercise
router.post(
  "/complete/:userId/:courseBatchId/:courseId/:exerciseId",
  isUser,
  completeExercise
);
// Course Batches Routes
router.get("/getCourseBatches", isUser, getCourseBatches);
router.get("/getCourseBatch/:courseBatchId", isUser, getCourseBatchById);

router.post("/createCourseBatch", isAdmin, createCourseBatch);
router.put("/updateCourseBatch", isAdmin, updateCourseBatch);
router.delete("/deleteCourseBatch", isAdmin, deleteCourseBatch);

// Courses Routes
router.get("/getCourses", getCourses);
router.get("/getCoursesById/:courseId", isUser, getCoursesById);

router.post("/createCourse", isAdmin, createCourse);
router.put("/updateCourse", isAdmin, updateCourse);
router.delete("/deleteCourse", isAdmin, deleteCourse);

export default router;

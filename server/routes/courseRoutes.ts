import { Router } from "express";

import { completeExercise } from "../controllers/courses/completeExercise";

// course batches
import { createCourseBatch } from "../controllers/courses/createCourseBatch";
import { getCourseBatches } from "../controllers/courses/getCourseBatches";
import { getCourseBatchById } from "../controllers/courses/getCourseBatchById";
import { updateCourseBatch } from "../controllers/courses/updateCourseBatch";
import { deleteCourseBatch } from "../controllers/courses/deleteCourseBatch";

// courses
import { getCourses } from "../controllers/courses/getCourses";
import { getCoursesById } from "../controllers/courses/getCoursesById";
import { createCourse } from "../controllers/courses/createCourse";
import { updateCourse } from "../controllers/courses/updateCourse";
import { deleteCourse } from "../controllers/courses/deleteCourse";
// middleware
import { isAdmin, isUser, } from "../middlewares/middleware";

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
router.get("/getCourses", isUser, getCourses);
router.get("/getCoursesById/:courseId", isUser, getCoursesById);

router.post("/createCourse", isAdmin, createCourse);
router.put("/updateCourse", isAdmin, updateCourse);
router.delete("/deleteCourse", isAdmin, deleteCourse);

export default router;

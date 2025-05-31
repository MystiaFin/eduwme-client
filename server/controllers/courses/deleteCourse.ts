import { Request, Response } from "express";
import Course from "../../models/Course";
import CourseBatch from "../../models/CourseBatch";
import { courseSchema } from "../../validators/course.validators.ts";

export const deleteCourse = async (
  req: Request,
  res: Response,
): Promise<Response | void> => {
  try {
    const { courseId, courseBatchId } = req.body;

    // basic validation
    if (!courseId) {
      res.status(400).json({ message: "Course ID is required" });
      return;
    }

    // find course
    const existingCourse = await Course.findOne({ courseId: courseId });
    if (!existingCourse) {
      res
        .status(404)
        .json({ message: `Course with Course ID ${courseId} not found` });
      return;
    }

    const existingCourseBatch = await CourseBatch.findOne({
      courseBatchId: courseBatchId,
    });
    if (!existingCourseBatch) {
      res.status(404).json({
        message: `Course batch with Course Batch ID ${courseBatchId} not found`,
      });
      return;
    }

    // delete courseId from courseList in courseBatch
    existingCourseBatch.courseList = existingCourseBatch.courseList.filter(
      (course) => course !== courseId,
    );
    if (existingCourseBatch.coursesLength > 0) {
      existingCourseBatch.coursesLength -= 1;
    }
    await existingCourseBatch.save();

    // delete course
    await Course.deleteOne({ courseId: courseId });

    res.status(200).json({ message: "Course deleted successfully" });
    return;
  } catch (err) {
    console.error(err);
    const message =
      err instanceof Error ? err.message : "An unknown error occurred";
    res.status(500).json({ error: message });
    return;
  }
};

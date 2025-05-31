import { Request, Response } from "express";
import Course from "../../models/Course";
import { courseSchema } from "../../validators/course.validators.ts";

export const getCoursesById = async (
  req: Request,
  res: Response,
): Promise<Response | void> => {
  try {
    const { courseId } = req.params;

    // basic validation
    if (!courseId) {
      res.status(400).json({ message: "Course ID is required" });
      return;
    }

    // find course
    const course = await Course.findOne({ courseId: courseId });
    if (!course) {
      res
        .status(404)
        .json({ message: `Course with Course ID ${courseId} not found.` });
      return;
    }

    res.status(200).json({ message: "Course retrieved successfully", course });
    return;
  } catch (err) {
    console.error(err);
    const message =
      err instanceof Error ? err.message : "An unknown error occurred";
    res.status(500).json({ error: message });
    return;
  }
};

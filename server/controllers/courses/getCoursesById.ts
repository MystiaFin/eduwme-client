import { Request, Response } from "express";
import Course from "../../models/Course";

export const getCoursesById = async (
  req: Request,
  res: Response,
): Promise<void> => {
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

    // Convert course to plain object
    const courseObject = course.toObject();
    
    // Convert binary logo data to base64 string if it exists
    const courseResponse = {
      ...courseObject,
      logo: courseObject.logo && courseObject.logo.data 
        ? `data:${courseObject.logo.contentType};base64,${courseObject.logo.data.toString('base64')}`
        : null
    };

    res.status(200).json({ message: "Course retrieved successfully", course: courseResponse });
    return;
  } catch (err) {
    console.error(err);
    const message =
      err instanceof Error ? err.message : "An unknown error occurred";
    res.status(500).json({ error: message });
    return;
  }
};
import { Request, Response } from "express";
import Course from "../../models/Course";
import CourseBatch from "../../models/CourseBatch";
import { courseUpdateSchema } from "../../validators/course.validators.ts";

export const updateCourse = async (
  req: Request,
  res: Response,
): Promise<Response | void> => {
  try {
    const validatedData = courseUpdateSchema.parse(req.body);
    const { courseBatchId, courseId, title, level } = validatedData;

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
        .json({ message: `Course with course ID ${course} not found.` });
      return;
    }

    // check if courseBatchId already exists in the database
    const existingCourseBatch = await CourseBatch.findOne({
      courseBatchId: courseBatchId,
    });
    if (!existingCourseBatch) {
      res.status(404).json({ message: "Course batch not found" });
      return;
    }

    // create new current date
    const dateCreated = new Date();

    // update course
    course.title = title;
    course.level = level;
    course.dateCreated = dateCreated;
    await course.save();

    res.status(200).json({ message: "Course updated successfully", course });
    return;
  } catch (err) {
    console.error(err);
    const message =
      err instanceof Error ? err.message : "An unknown error occurred";
    res.status(500).json({ error: message });
    return;
  }
};

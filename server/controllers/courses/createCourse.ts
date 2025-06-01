import { Request, Response } from "express";
import Course from "../../models/Course";
import CourseBatch from "../../models/CourseBatch";
import { courseSchema } from "../../validators/course.validators.ts";

export const createCourse = async (
  req: Request,
  res: Response,
): Promise<Response | void> => {
  try {
    const validatedData = courseSchema.parse(req.body);
    const { courseBatchId, courseId, title, logo, level } = validatedData;

    // basic validation
    if (!courseBatchId) {
      res.status(400).json({ message: "Course batch ID is required" });
      return;
    }

    if (!courseId) {
      res.status(400).json({ message: "Course ID is required" });
      return;
    }
    if (!level) {
      res.status(400).json({ message: "Level is required" });
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

    // find course
    const courseFind = await Course.findOne({ courseId: courseId });
    if (courseFind) {
      res.status(404).json({ message: "Course is already in the database" });
      return;
    }

    // push courseId to courseList in courseBatch
    existingCourseBatch.courseList.push(courseId);
    existingCourseBatch.coursesLength += 1;
    await existingCourseBatch.save();

    // create date
    const dateCreated = new Date();

    // exercises length
    const exerciseBatchList: string[] = [];

    // check how many exercises are in the exercise database
    const exercisesLength = exerciseBatchList.length;

    // create course
    const course = new Course({
      courseBatchId,
      courseId,
      title,
      level,
      dateCreated,
      exerciseBatchList,
      exercisesLength,
      logo, 
    });
    await course.save();

    res.status(200).json({ message: "Course created.", course });
    return;
  } catch (err) {
    console.error(err);
    const message =
      err instanceof Error ? err.message : "An unknown error occurred";
    res.status(500).json({ error: message });
    return;
  }
};

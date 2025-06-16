import { Request, Response } from "express";
import CourseBatch from "../../models/CourseBatch";
import { courseBatchSchema } from "../../validators/courseBatch.validators";

export const createCourseBatch = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    // validate request body
    const validatedData = courseBatchSchema.parse(req.body);
    const { courseBatchId, stage } = validatedData;

    // basic validation
    if (!courseBatchId) {
      res.status(400).json({ message: "Course batch ID is required" });
      return;
    }
    // check if courseBatchId already exists in the database
    const existingCourseBatch = await CourseBatch.findOne({
      courseBatchId: courseBatchId,
    });
    if (existingCourseBatch) {
      res.status(400).json({ message: "Course batch ID already exists" });
      return;
    }

    const courseList: unknown[] = [];

    // check how many courses are in the course database
    const coursesLength: number = courseList.length;

    const courseBatch = new CourseBatch({
      courseBatchId,
      dateCreated: new Date(),
      courseList: courseList,
      stage: stage,
      coursesLength,
    });
    await courseBatch.save();

    res
      .status(200)
      .json({ message: "Course batch created successfully", courseBatch });
    return;
  } catch (err) {
    console.error(err);
    const message =
      err instanceof Error ? err.message : "An unknown error occurred";
    res.status(500).json({ error: message });
    return;
  }
};

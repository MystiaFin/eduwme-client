import { Request, Response } from "express";
import CourseBatch  from "../../models/CourseBatch";
import { courseBatchUpdateSchema } from "../../validators/courseBatch.validators";

export const updateCourseBatch = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const validatedData = courseBatchUpdateSchema.parse(req.body);
    const { courseBatchId, stage } = validatedData;

    // basic validation
    if (!courseBatchId) {
      res.status(400).json({ message: "Course batch ID is required" });
      return;
    }

    // find course batch
    const courseBatch = await CourseBatch.findOne({
      courseBatchId: courseBatchId,
    });
    if (!courseBatch) {
      res.status(404).json({ message: "Course batch not found" });
      return;
    }

    // update the date
    const newDate = new Date();

    courseBatch.stage = stage;
    courseBatch.dateCreated = newDate;
    await courseBatch.save();

    res
      .status(200)
      .json({ message: "Course batch updated successfully", courseBatch });
  } catch (err) {
    console.error(err);
    const message =
      err instanceof Error ? err.message : "An unknown error occurred";
    res.status(500).json({ error: message });
    return;
  }
};

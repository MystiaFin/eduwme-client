import { Request, Response } from "express";
import CourseBatch from "../../models/CourseBatch";

export const deleteCourseBatch = async (
  req: Request,
  res: Response,
): Promise<Response | void> => {
  try {
    const { courseBatchId } = req.body;

    // basic validation
    if (!courseBatchId) {
      res.status(400).json({ message: "Course batch ID is required" });
      return;
    }

    // find course batch
    const existingCourseBatch = await CourseBatch.findOne({
      courseBatchId: courseBatchId,
    });
    if (!existingCourseBatch) {
      res.status(404).json({
        message: `Course batch with Course Batch ID ${courseBatchId} not found`,
      });
      return;
    }

    // delete course batch
    await CourseBatch.deleteOne({ courseBatchId: courseBatchId });

    res.status(200).json({ message: "Course batch deleted successfully" });
    return;
  } catch (err) {
    console.error(err);
    const message =
      err instanceof Error ? err.message : "An unknown error occurred";
    res.status(500).json({ error: message });
    return;
  }
};

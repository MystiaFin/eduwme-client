import { Request, Response } from "express";
import CourseBatch from "../../models/CourseBatch";

export const getCourseBatchById = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { courseBatchId } = req.params;

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
      res.status(404).json({
        message: `Course batch with Course Batch ID ${courseBatchId} not found.`,
      });
      return;
    }

    res
      .status(200)
      .json({ message: "Course batch retrieved successfully", courseBatch });
    return;
  } catch (err) {
    console.error(err);
    const message =
      err instanceof Error ? err.message : "An unknown error occurred";
    res.status(500).json({ error: message });
    return;
  }
};

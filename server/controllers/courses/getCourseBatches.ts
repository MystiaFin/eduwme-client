import { Request, Response } from "express";
import CourseBatch from "../../models/CourseBatch";

export const getCourseBatches = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const courseBatches = await CourseBatch.find();

    if (!courseBatches || courseBatches.length === 0) {
      res.status(404).json({ message: "No course batches found" });
      return;
    }

    interface CourseBatchItem {
      courseBatchId: string;
      dateCreated: Date | string;
      courseList: string[];
      stage: number;
      coursesLength: number;
    }

    const courseBatchList: CourseBatchItem[] = [];

    courseBatches.forEach((courseBatch) => {
      courseBatchList.push({
        courseBatchId: courseBatch.courseBatchId,
        dateCreated: courseBatch.dateCreated,
        courseList: courseBatch.courseList,
        stage: courseBatch.stage,
        coursesLength: courseBatch.coursesLength,
      });
    });

    res.status(200).json({
      message: "Course batches retrieved successfully",
      courseBatchList,
    });
    return;
  } catch (err) {
    console.error(err);
    const message =
      err instanceof Error ? err.message : "An unknown error occurred";
    res.status(500).json({ error: message });
    return;
  }
};

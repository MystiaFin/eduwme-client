import { Request, Response } from "express";
import Course from "../../models/Course.ts";
import Exercise from "../../models/Exercise.ts";

export const deleteExercise = async (
  req: Request,
  res: Response,
): Promise<Response | void> => {
  try {
    const { exerciseId, courseId } = req.body;

    // basic validation
    if (!exerciseId) {
      res.status(400).json({ message: "Exercise ID is required" });
      return;
    }

    const existingCourse = await Course.findOne({ courseId: courseId });
    if (!existingCourse) {
      res
        .status(404)
        .json({ message: `Course with Course ID ${courseId} not found` });
      return;
    }

    // find exercise
    const exercise = await Exercise.findOne({ exerciseId: exerciseId });
    if (!exercise) {
      res.status(404).json({
        message: `Exercise with Exercise ID ${exerciseId} not found`,
      });
      return;
    }

    // delete exerciseId from exerciseBatchList in course
    existingCourse.exerciseBatchList = existingCourse.exerciseBatchList.filter(
      (exercise) => exercise !== exerciseId,
    );
    if (existingCourse.exercisesLength > 0) {
      existingCourse.exercisesLength -= 1;
    }
    await existingCourse.save();

    // delete exercise
    await Exercise.deleteOne({ exerciseId: exerciseId });

    res.status(200).json({ message: "Exercise deleted successfully" });
    return;
  } catch (err) {
    console.error(err);
    const message =
      err instanceof Error ? err.message : "An unknown error occurred";
    res.status(500).json({ error: message });
    return;
  }
};

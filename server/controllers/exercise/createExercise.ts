import Exercise from "../../models/Exercise.ts";
import Course from "../../models/Course.ts";
import CourseBatch from "../../models/CourseBatch.ts";

export const createExercise = async (
  req: Request,
  res: Response,
): Promise<Response> => {
  try {
    const validatedData = createExerciseSchema.parse(req.body);
    const {
      exerciseId,
      courseId,
      courseBatchId,
      title,
      difficultyLevel,
      animType,
      type,
      question,
      options,
      answer,
    } = validatedData;

    // Check if exerciseId already exists
    const existingExercise = await Exercise.findOne({ exerciseId });
    if (existingExercise) {
      res.status(400).json({ message: "Exercise ID already exists" });
      return;
    }

    // Check if the referenced courseId exists
    const existingCourse = await Course.findOne({ courseId });
    if (!existingCourse) {
      res
        .status(404)
        .json({ message: `Course with ID ${courseId} not found.` });
      return;
    }

    // Check if the referenced courseBatchId exists
    const existingCourseBatch = await CourseBatch.findOne({ courseBatchId });
    if (!existingCourseBatch) {
      res
        .status(404)
        .json({ message: `CourseBatch with ID ${courseBatchId} not found.` });
      return;
    }

    // push exerciseId to exerciseBatchList in course
    existingCourse.exerciseBatchList.push(exerciseId);
    existingCourse.exercisesLength += 1;
    await existingCourse.save();

    const newExercise = new Exercise({
      exerciseId,
      courseId,
      courseBatchId, // Will be undefined if not provided, which is fine if schema is optional
      title,
      dateCreated: new Date(), // Set by the server
      difficultyLevel,
      animType,
      type,
      question,
      options,
      answer,
    });

    await newExercise.save();

    res.status(201).json({
      message: "Exercise created successfully",
      exercise: newExercise,
    });
    return;
  } catch (err) {
    console.error(err);
    if (err instanceof ZodError) {
      res
        .status(400)
        .json({ message: "Validation failed", errors: err.errors });
      return;
    }
    const message =
      err instanceof Error ? err.message : "An unknown error occurred";
    res.status(500).json({ error: message });
    return;
  }
};

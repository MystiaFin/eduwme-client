export const updateExercise = async (
  req: Request,
  res: Response,
): Promise<Response> => {
  try {
    const validatedData = updateExerciseSchema.parse(req.body);
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

    // basic validation
    if (!exerciseId) {
      res.status(400).json({ message: "Exercise ID is required" });
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

    // check if courseId already exists in the database
    const existingCourse = await Course.findOne({ courseId: courseId });
    if (!existingCourse) {
      res.status(404).json({ message: "Course not found" });
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

    // update exercise
    exercise.title = title;
    exercise.difficultyLevel = difficultyLevel;
    exercise.dateCreated = dateCreated;
    exercise.animType = animType;
    exercise.type = type;
    exercise.question = question;
    exercise.options = options;
    exercise.answer = answer;

    await exercise.save();

    res
      .status(200)
      .json({ message: "Exercise updated successfully", exercise });
  } catch (err) {
    console.error(err);
    const message =
      err instanceof Error ? err.message : "An unknown error occurred";
    res.status(500).json({ error: message });
    return;
  }
};

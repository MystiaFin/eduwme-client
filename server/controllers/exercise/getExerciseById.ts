export const getExerciseById = async (
  req: Request,
  res: Response,
): Promise<Response> => {
  try {
    const { exerciseId } = req.params;
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
    res
      .status(200)
      .json({ message: "Exercise retrieved successfully", exercise });
    return;
  } catch (err) {
    console.error(err);
    const message =
      err instanceof Error ? err.message : "An unknown error occurred";
    res.status(500).json({ error: message });
    return;
  }
};

import { Request, Response } from "express";
import { completeSchema } from "../../validators/progress.validators.ts";
import User from "../../models/User.ts";
import CourseBatch  from "../../models/CourseBatch.ts";
import Course from "../../models/Course.ts";
import Exercise from "../../models/Exercise.ts";

export const completeExercise = async (
  req: Request,
  res: Response,
): Promise<Response | void> => {
  try {
    // validate request body with zod
    const validatedData = completeSchema.parse(req.params);
    const { userId, courseBatchId, courseId, exerciseId } = validatedData;

    // Find the user first - we'll need the complete document
    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    // Verify that all referenced entities exist
    const courseBatch = await CourseBatch.findOne({
      courseBatchId: courseBatchId,
    });
    if (!courseBatch) {
      res.status(404).json({ message: "Course batch not found" });
      return;
    }

    const course = await Course.findOne({ courseId: courseId });
    if (!course) {
      res.status(404).json({ message: "Course not found" });
      return;
    }

    const exercise = await Exercise.findOne({ exerciseId: exerciseId });
    if (!exercise) {
      res.status(404).json({ message: "Exercise not found" });
      return;
    }

    // Find if the batch exists in user's progress
    const batchIndex = user.courseBatchesProgress.findIndex(
      (batch) => batch.courseBatchId === courseBatchId,
    );
    const batchExists = batchIndex !== -1;

    // Find if the course exists within the specific batch
    let courseExists = false;
    let courseIndex = -1;
    if (batchExists) {
      courseIndex = user.courseBatchesProgress[batchIndex].courses.findIndex(
        (c) => c.courseId === courseId,
      );
      courseExists = courseIndex !== -1;
    }

    // Find if the exercise exists within the specific course in the specific batch
    let exerciseExists = false;
    let exerciseIndex = -1;
    let alreadyCompleted = false;
    if (courseExists) {
      exerciseIndex = user.courseBatchesProgress[batchIndex].courses[
        courseIndex
      ].exercises.findIndex((e) => e.exerciseId === exerciseId);
      exerciseExists = exerciseIndex !== -1;

      // Check if already completed
      if (exerciseExists) {
        const exerciseStatus =
          user.courseBatchesProgress[batchIndex].courses[courseIndex].exercises[
            exerciseIndex
          ].status;
        alreadyCompleted = exerciseStatus === "completed";
      }
    }

    // Calculate XP based on difficulty (only if not already completed)
    let awardedXp = 0;
    let awardedGems = 0;
    if (!alreadyCompleted) {
      // Award XP based on difficulty level
      awardedXp = exercise.difficultyLevel * 10; // Base formula - adjust as needed
      awardedGems = exercise.difficultyLevel * 5; // Assuming gems are half of XP

      // Add XP to user
      user.xp = (user.xp || 0) + awardedXp;

      user.gems = (user.gems || 0) + awardedGems; // Assuming gems are awarded same as XP

      // Check if user should level up (simple formula: level = 1 + floor(xp/100))
      const newLevel = Math.floor(1 + user.xp / 100);
      if (newLevel > user.level) {
        user.level = newLevel;
      }
    }

    // Define objects as before
    const exercises = {
      exerciseId: exerciseId,
      status: "completed",
      score: 0,
      lastAttempted: new Date(),
    };

    const fullBeginnerBatchProgress = {
      courseBatchId: courseBatchId,
      status: "in_progress",
      completedCoursesCount: 0,
      totalCoursesInBatch: courseBatch.courseList.length,
      courses: [
        {
          courseId: courseId,
          status: "in_progress",
          completedExercisesCount: 1, // Set to 1 since this exercise is completed
          totalExercisesInCourse: course.exerciseBatchList.length,
          exercises: [
            {
              exerciseId: exerciseId,
              status: "completed",
              score: 0,
              lastAttempted: new Date(),
            },
          ],
        },
      ],
    };

    const fullCourse = {
      courseId: courseId,
      status: "in_progress",
      completedExercisesCount: 1, // Set to 1 since this exercise is completed
      totalExercisesInCourse: course.exerciseBatchList.length,
      exercises: [
        {
          exerciseId: exerciseId,
          status: "completed",
          score: 0,
          lastAttempted: new Date(),
        },
      ],
    };

    // Update based on what exists
    if (!batchExists) {
      // Add the new batch progress
      user.courseBatchesProgress.push(fullBeginnerBatchProgress);

      // Get the new indexes since we just added items
      const newBatchIndex = user.courseBatchesProgress.length - 1;

      // Check if course is now complete
      const totalExercises = course.exerciseBatchList.length;
      const completedExercises =
        user.courseBatchesProgress[newBatchIndex].courses[0]
          .completedExercisesCount;

      if (completedExercises >= totalExercises) {
        // Mark course as completed
        user.courseBatchesProgress[newBatchIndex].courses[0].status =
          "completed";

        // Increment completed courses count for the batch
        user.courseBatchesProgress[newBatchIndex].completedCoursesCount += 1;

        // Check if batch is now complete
        const totalCourses = courseBatch.courseList.length;
        const completedCourses =
          user.courseBatchesProgress[newBatchIndex].completedCoursesCount;

        if (completedCourses >= totalCourses) {
          // Mark batch as completed
          user.courseBatchesProgress[newBatchIndex].status = "completed";
        }
      }
    } else if (!courseExists) {
      // Add the new course to existing batch
      user.courseBatchesProgress[batchIndex].courses.push(fullCourse);

      // Get the new course index since we just added it
      const newCourseIndex =
        user.courseBatchesProgress[batchIndex].courses.length - 1;

      // Check if course is now complete
      const totalExercises = course.exerciseBatchList.length;
      const completedExercises =
        user.courseBatchesProgress[batchIndex].courses[newCourseIndex]
          .completedExercisesCount;

      if (completedExercises >= totalExercises) {
        // Mark course as completed
        user.courseBatchesProgress[batchIndex].courses[newCourseIndex].status =
          "completed";

        // Increment completed courses count for the batch
        user.courseBatchesProgress[batchIndex].completedCoursesCount += 1;

        // Check if batch is now complete
        const totalCourses = courseBatch.courseList.length;
        const completedCourses =
          user.courseBatchesProgress[batchIndex].completedCoursesCount;

        if (completedCourses >= totalCourses) {
          // Mark batch as completed
          user.courseBatchesProgress[batchIndex].status = "completed";
        }
      }
    } else if (!exerciseExists) {
      // Add the new exercise to existing course
      user.courseBatchesProgress[batchIndex].courses[
        courseIndex
      ].exercises.push(exercises);

      // Update completion counts if this is a new completion (and we already have batch and course)
      if (batchExists && courseExists) {
        // Increment completed exercises count for this course
        user.courseBatchesProgress[batchIndex].courses[
          courseIndex
        ].completedExercisesCount += 1;

        // Check if course is now complete
        const totalExercises = course.exerciseBatchList.length;
        const completedExercises =
          user.courseBatchesProgress[batchIndex].courses[courseIndex]
            .completedExercisesCount;

        if (completedExercises >= totalExercises) {
          // Mark course as completed
          user.courseBatchesProgress[batchIndex].courses[courseIndex].status =
            "completed";

          // Increment completed courses count for the batch
          user.courseBatchesProgress[batchIndex].completedCoursesCount += 1;

          // Check if batch is now complete
          const totalCourses = courseBatch.courseList.length;
          const completedCourses =
            user.courseBatchesProgress[batchIndex].completedCoursesCount;

          if (completedCourses >= totalCourses) {
            // Mark batch as completed
            user.courseBatchesProgress[batchIndex].status = "completed";
          }
        }
      }
    } else if (!alreadyCompleted) {
      // Update existing exercise if not already completed
      user.courseBatchesProgress[batchIndex].courses[courseIndex].exercises[
        exerciseIndex
      ].status = "completed";
      user.courseBatchesProgress[batchIndex].courses[courseIndex].exercises[
        exerciseIndex
      ].lastAttempted = new Date();

      // Update completion counts (we know batch and course exist since we're updating an exercise)
      // Increment completed exercises count for this course
      user.courseBatchesProgress[batchIndex].courses[
        courseIndex
      ].completedExercisesCount += 1;

      // Check if course is now complete
      const totalExercises = course.exerciseBatchList.length;
      const completedExercises =
        user.courseBatchesProgress[batchIndex].courses[courseIndex]
          .completedExercisesCount;

      if (completedExercises >= totalExercises) {
        // Mark course as completed
        user.courseBatchesProgress[batchIndex].courses[courseIndex].status =
          "completed";

        // Increment completed courses count for the batch
        user.courseBatchesProgress[batchIndex].completedCoursesCount += 1;

        // Check if batch is now complete
        const totalCourses = courseBatch.courseList.length;
        const completedCourses =
          user.courseBatchesProgress[batchIndex].completedCoursesCount;

        if (completedCourses >= totalCourses) {
          // Mark batch as completed
          user.courseBatchesProgress[batchIndex].status = "completed";
        }
      }
    }

    // Default to 0 for course progress
    let courseProgress = 0;

    // Only calculate course progress if both batch and course exist
    if (batchExists && courseExists) {
      courseProgress =
        user.courseBatchesProgress[batchIndex].courses[courseIndex]
          .completedExercisesCount /
        user.courseBatchesProgress[batchIndex].courses[courseIndex]
          .totalExercisesInCourse;
    }

    // Updating course progress if batch exists but course does not
    if (!batchExists) {
      const newBatchIndex = user.courseBatchesProgress.length - 1;
      courseProgress =
        user.courseBatchesProgress[newBatchIndex].courses[0]
          .completedExercisesCount /
        user.courseBatchesProgress[newBatchIndex].courses[0]
          .totalExercisesInCourse;
    } else if (!courseExists) {
      const newCourseIndex =
        user.courseBatchesProgress[batchIndex].courses.length - 1;
      courseProgress =
        user.courseBatchesProgress[batchIndex].courses[newCourseIndex]
          .completedExercisesCount /
        user.courseBatchesProgress[batchIndex].courses[newCourseIndex]
          .totalExercisesInCourse;
    }

    // Mark as modified and save the user document
    user.markModified("courseBatchesProgress");
    user.markModified("xp");
    user.markModified("level");
    user.markModified("gems");
    await user.save();

    res.status(200).json({
      message: "Exercise completed successfully",
      awardedXp,
      currentXp: user.xp,
      level: user.level,
      alreadyCompleted,
      exerciseStatus: {
        courseBatchId: courseBatchId,
        courseId: courseId,
        exerciseId: exerciseId,
        status: "completed",
      },
      courseProgress: courseProgress,
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

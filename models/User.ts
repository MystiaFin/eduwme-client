import mongoose, { Schema } from 'mongoose';

// Sub-schema for individual exercise progress
const exerciseProgressSchema = new Schema({
  exerciseId: { type: String, required: true }, // Corresponds to Exercise.exerciseId
  status: {
    type: String,
    enum: ['not_started', 'in_progress', 'completed'],
    default: 'not_started',
    required: true
  },
  score: { type: Number, min: 0, default: 0 }, // Optional: score achieved
  lastAttempted: { type: Date }
}, { _id: false }); // No separate _id for each exercise progress entry within a course

// Sub-schema for progress within a single course
const courseProgressSchema = new Schema({
  courseId: { type: String, required: true }, // Corresponds to Course.courseId
  status: {
    type: String,
    enum: ['not_started', 'in_progress', 'completed'],
    default: 'not_started',
    required: true
  },
  // To calculate progressPercentage = (completedExercises / totalExercisesInCourse) * 100
  completedExercisesCount: { type: Number, default: 0, required: true },
  // totalExercisesInCourse might be populated when a user starts a course, by looking up the Course model
  exercises: [exerciseProgressSchema] // Detailed progress for each exercise in this course
}, { _id: false }); // No separate _id for each course progress entry within a batch

// Sub-schema for progress within a course batch
const courseBatchProgressSchema = new Schema({
  courseBatchId: { type: String, required: true }, // Corresponds to CourseBatch.courseBatchId
  status: {
    type: String,
    enum: ['not_started', 'in_progress', 'completed'],
    default: 'not_started',
    required: true
  },
  // To calculate progressPercentage = (completedCourses / totalCoursesInBatch) * 100
  completedCoursesCount: { type: Number, default: 0, required: true },
  // totalCoursesInBatch might be populated when a user starts a batch
  courses: [courseProgressSchema] // Detailed progress for each course in this batch
}, { _id: false }); // No separate _id for each course batch progress entry

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  xp: { type: Number, default: 0, required: true }, // User's total experience points
  level: { type: Number, default: 1, required: true }, // User's overall level
  courseBatchesProgress: [courseBatchProgressSchema] // Array to store progress for all course batches
});

const User = mongoose.model('User', userSchema);

export default User;
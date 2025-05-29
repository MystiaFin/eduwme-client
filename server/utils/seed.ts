import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../models/User";
import CourseBatch from "../models/CourseBatch";
import Course from "../models/Course";
import Exercise from "../models/Exercise";
import bcrypt from "bcrypt";

dotenv.config();

const MONGO_URI: string = process.env.MONGO_URI || "";

if (!MONGO_URI) {
  console.error("MONGO_URI not found or is empty in .env file");
  process.exit(1);
}

mongoose
  .connect(MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => {
    console.error("DB Connection failed:", err);
    process.exit(1);
  });

// this function clears existing data so be sure uncomment this function if you want to clear the database
async function clearCollections() {
  console.log("Clearing existing collections...");
  await User.deleteMany({});
  await Exercise.deleteMany({});
  await Course.deleteMany({});
  await CourseBatch.deleteMany({});
  console.log("Collections cleared.");
}

async function seedUsers() {
  console.log("Seeding users...");

  const hashedPassword = await bcrypt.hash("password123", 10);

  const users = [
    {
      username: "testuser",
      password: hashedPassword,
      email: "testuser@example.com",
      nickname: "Test User",
      biodata: "This is a test user account",
      xp: 100,
      level: 2,
      gems: 20,
      dateCreated: new Date(),
      dateLastLogin: new Date(),
    },
  ];

  await User.insertMany(users);
  console.log(`${users.length} successfully seeded`);
}

async function seedCourseBatches() {
  console.log("Seeding course batches...");

  const batches = [
    {
      courseBatchId: "basic-math-operations",
      dateCreated: new Date(),
      courseList: [],
      coursesLength: 0,
      stage: 1,
    },
  ];

  await CourseBatch.insertMany(batches);
  console.log(`${batches.length} course batches seeded`);
  return batches;
}

async function seedCourses(batches) {
  console.log("Seeding courses...");

  const courses = [
    {
      courseBatchId: "basic-math-operations",
      courseId: "addition",
      title: "Addition",
      level: 1,
      dateCreated: new Date(),
      exerciseBatchList: [],
      exercisesLength: 0,
    },
    {
      courseBatchId: "basic-math-operations",
      courseId: "subtraction",
      title: "Subtraction",
      level: 1,
      dateCreated: new Date(),
      exerciseBatchList: [],
      exercisesLength: 0,
    },
    {
      courseBatchId: "basic-math-operations",
      courseId: "multiplication",
      title: "Multiplication",
      level: 2,
      dateCreated: new Date(),
      exerciseBatchList: [],
      exercisesLength: 0,
    },
    {
      courseBatchId: "basic-math-operations",
      courseId: "division",
      title: "Division",
      level: 2,
      dateCreated: new Date(),
      exerciseBatchList: [],
      exercisesLength: 0,
    },
  ];

  await Course.insertMany(courses);

  for (const batch of batches) {
    const coursesInBatch = courses.filter(
      (c) => c.courseBatchId === batch.courseBatchId,
    );
    const courseIds = coursesInBatch.map((c) => c.courseId);

    await CourseBatch.updateOne(
      { courseBatchId: batch.courseBatchId },
      {
        courseList: courseIds,
        coursesLength: courseIds.length,
      },
    );
  }

  console.log(`${courses.length} courses successfully seeded`);
  return courses;
}

async function seedExercises(courses) {
  console.log("Seeding exercises...");

  const exercises = [
    {
      exerciseId: "add-ex-1",
      courseId: "addition",
      courseBatchId: "basic-math-operations",
      title: "Single Digit Addition",
      difficultyLevel: 1,
      dateCreated: new Date(),
      animType: "static",
      type: "multiple-choice",
      question: "What is 3 + 4?",
      options: ["5", "6", "7", "8"],
      answer: "7",
    },
    {
      exerciseId: "add-ex-2",
      courseId: "addition",
      courseBatchId: "basic-math-operations",
      title: "Double Digit Addition",
      difficultyLevel: 2,
      dateCreated: new Date(),
      animType: "static",
      type: "multiple-choice",
      question: "What is 15 + 27?",
      options: ["32", "42", "52", "62"],
      answer: "42",
    },
    {
      exerciseId: "add-ex-3",
      courseId: "addition",
      courseBatchId: "basic-math-operations",
      title: "Adding Three Numbers",
      difficultyLevel: 3,
      dateCreated: new Date(),
      animType: "dynamic",
      type: "multiple-choice",
      question: "What is 4 + 8 + 7?",
      options: ["15", "17", "19", "21"],
      answer: "19",
    },

    {
      exerciseId: "sub-ex-1",
      courseId: "subtraction",
      courseBatchId: "basic-math-operations",
      title: "Single Digit Subtraction",
      difficultyLevel: 1,
      dateCreated: new Date(),
      animType: "static",
      type: "multiple-choice",
      question: "What is 9 - 4?",
      options: ["3", "4", "5", "6"],
      answer: "5",
    },
    {
      exerciseId: "sub-ex-2",
      courseId: "subtraction",
      courseBatchId: "basic-math-operations",
      title: "Double Digit Subtraction",
      difficultyLevel: 2,
      dateCreated: new Date(),
      animType: "static",
      type: "multiple-choice",
      question: "What is 42 - 17?",
      options: ["15", "20", "25", "30"],
      answer: "25",
    },
    {
      exerciseId: "sub-ex-3",
      courseId: "subtraction",
      courseBatchId: "basic-math-operations",
      title: "Borrowing in Subtraction",
      difficultyLevel: 3,
      dateCreated: new Date(),
      animType: "dynamic",
      type: "multiple-choice",
      question: "What is 103 - 45?",
      options: ["48", "58", "68", "78"],
      answer: "58",
    },

    {
      exerciseId: "mult-ex-1",
      courseId: "multiplication",
      courseBatchId: "basic-math-operations",
      title: "Single Digit Multiplication",
      difficultyLevel: 1,
      dateCreated: new Date(),
      animType: "static",
      type: "multiple-choice",
      question: "What is 7 × 6?",
      options: ["36", "42", "48", "54"],
      answer: "42",
    },
    {
      exerciseId: "mult-ex-2",
      courseId: "multiplication",
      courseBatchId: "basic-math-operations",
      title: "Multiplying by 10s",
      difficultyLevel: 2,
      dateCreated: new Date(),
      animType: "static",
      type: "multiple-choice",
      question: "What is 30 × 4?",
      options: ["90", "100", "110", "120"],
      answer: "120",
    },
    {
      exerciseId: "mult-ex-3",
      courseId: "multiplication",
      courseBatchId: "basic-math-operations",
      title: "Two-Digit Multiplication",
      difficultyLevel: 3,
      dateCreated: new Date(),
      animType: "dynamic",
      type: "multiple-choice",
      question: "What is 12 × 15?",
      options: ["160", "170", "180", "190"],
      answer: "180",
    },

    {
      exerciseId: "div-ex-1",
      courseId: "division",
      courseBatchId: "basic-math-operations",
      title: "Simple Division",
      difficultyLevel: 1,
      dateCreated: new Date(),
      animType: "static",
      type: "multiple-choice",
      question: "What is 24 ÷ 8?",
      options: ["2", "3", "4", "6"],
      answer: "3",
    },
    {
      exerciseId: "div-ex-2",
      courseId: "division",
      courseBatchId: "basic-math-operations",
      title: "Division with Remainder",
      difficultyLevel: 2,
      dateCreated: new Date(),
      animType: "static",
      type: "multiple-choice",
      question: "What is 25 ÷ 4?",
      options: ["6", "6 with remainder 1", "6.25", "7"],
      answer: "6 with remainder 1",
    },
    {
      exerciseId: "div-ex-3",
      courseId: "division",
      courseBatchId: "basic-math-operations",
      title: "Long Division",
      difficultyLevel: 3,
      dateCreated: new Date(),
      animType: "dynamic",
      type: "multiple-choice",
      question: "What is 156 ÷ 12?",
      options: ["11", "12", "13", "14"],
      answer: "13",
    },
  ];

  await Exercise.insertMany(exercises);

  for (const course of courses) {
    const exercisesInCourse = exercises.filter(
      (e) => e.courseId === course.courseId,
    );
    const exerciseIds = exercisesInCourse.map((e) => e.exerciseId);

    await Course.updateOne(
      { courseId: course.courseId },
      {
        exerciseBatchList: exerciseIds,
        exercisesLength: exerciseIds.length,
      },
    );
  }

  console.log(`${exercises.length} exercises seeded`);
}

async function seedDatabase() {
  try {
    // remember to uncomment clearCollections if you want to clear the database
    await clearCollections();
    await seedUsers();
    const batches = await seedCourseBatches();
    const courses = await seedCourses(batches);
    await seedExercises(courses);

    console.log("db seeding process completed");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  }
}

seedDatabase();

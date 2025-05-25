import express, { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import cors from "cors";
import mongoose from "mongoose";
import { ZodError } from "zod";

// routes imports
import userRoutes from "./server/routes/userRoutes.ts";
import courseRoutes from "./server/routes/courseRoutes.ts";
import exerciseRoutes from "./server/routes/exerciseRoutes.ts";

// utils imports
import genericSearch from "./server/utils/genericSearch.ts";
import searchUsers from "./server/utils/searchUsers.ts";
import searchCourses from "./server/utils/searchCourses.ts";
import searchExercises from "./server/utils/searchExercises.ts";

import verifyTokenMiddleware from "./server/middlewares/middleware.js";

import { profileSchema } from "./validators/profile.validators.js";

dotenv.config();

const PORT: number = process.env.PORT ? Number(process.env.PORT) : 3000;
const MONGO_URI: undefined | string = process.env.MONGO_URI || "";
const JWT_SECRET: string = process.env.JWT_SECRET;
const EXPIRATION_TIME: string = process.env.EXPIRATION_TIME;

// .env variables checking
const requiredEnv = {
  MONGO_URI,
  JWT_SECRET,
  EXPIRATION_TIME,
};

for (const [key, value] of Object.entries(requiredEnv)) {
  if (!value) {
    console.error(`${key} is not set`);
    process.exit(1);
  }
}

// connect to MongoDB
mongoose
  .connect(MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  });

const app = express();

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);
app.use(express.json());

// routes initiation
app.use("/users", userRoutes);
app.use("/courses", courseRoutes);
app.use("/exercises", exerciseRoutes);

/**
 * Generic Search, Sort and Pagination Function
 * @param model - The Mongoose model to search
 * @param validSearchKeys - Array of valid keys for searching
 * @param validSortKeys - Array of valid keys for sorting
 * @param numericFields - Array of fields that should be treated as numbers
 * @param search - Search string in format "key:value"
 * @param sort - Sort string in format "field:order"
 * @param pageNumber - Page number for pagination
 * @param pageSize - Number of items per page
 */
app.use(genericSearch);
app.use(searchUsers);
app.use(searchCourses);
app.use(searchExercises);

//app.put(
//  "/updateExercise",
//  verifyTokenMiddleware,
//  async (req: Request, res: Response): Promise<void> => {
//    try {
//      const validatedData = updateExerciseSchema.parse(req.body);
//      const {
//        exerciseId,
//        courseId,
//        courseBatchId,
//        title,
//        difficultyLevel,
//        animType,
//        type,
//        question,
//        options,
//        answer,
//      } = validatedData;
//
//      // basic validation
//      if (!exerciseId) {
//        res.status(400).json({ message: "Exercise ID is required" });
//        return;
//      }
//      // find exercise
//      const exercise = await Exercise.findOne({ exerciseId: exerciseId });
//      if (!exercise) {
//        res.status(404).json({
//          message: `Exercise with Exercise ID ${exerciseId} not found`,
//        });
//        return;
//      }
//
//      // check if courseId already exists in the database
//      const existingCourse = await Course.findOne({ courseId: courseId });
//      if (!existingCourse) {
//        res.status(404).json({ message: "Course not found" });
//        return;
//      }
//
//      // check if courseBatchId already exists in the database
//      const existingCourseBatch = await CourseBatch.findOne({
//        courseBatchId: courseBatchId,
//      });
//      if (!existingCourseBatch) {
//        res.status(404).json({ message: "Course batch not found" });
//        return;
//      }
//      // create new current date
//      const dateCreated = new Date();
//
//      // update exercise
//      exercise.title = title;
//      exercise.difficultyLevel = difficultyLevel;
//      exercise.dateCreated = dateCreated;
//      exercise.animType = animType;
//      exercise.type = type;
//      exercise.question = question;
//      exercise.options = options;
//      exercise.answer = answer;
//      await exercise.save();
//      res
//        .status(200)
//        .json({ message: "Exercise updated successfully", exercise });
//      return;
//    } catch (err) {
//      console.error(err);
//      if (err instanceof ZodError) {
//        res
//          .status(400)
//          .json({ message: "Validation failed", errors: err.errors });
//        return;
//      }
//      const message =
//        err instanceof Error ? err.message : "An unknown error occurred";
//      res.status(500).json({ error: message });
//      return;
//    }
//  },
//);
=======

// start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

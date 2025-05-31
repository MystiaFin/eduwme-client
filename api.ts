import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import mongoose from "mongoose";

// routes imports
import userRoutes from "./server/routes/userRoutes";
import courseRoutes from "./server/routes/courseRoutes";
import exerciseRoutes from "./server/routes/exerciseRoutes";
import shopItemRoutes from "./server/routes/shopItemRoutes";

// admin routes
import adminRoutes from "./server/routes/adminRoutes";

// utils imports
import genericSearch from "./server/utils/genericSearch";
import searchUsers from "./server/utils/searchUsers";
import searchCourses from "./server/utils/searchCourses";
import searchExercises from "./server/utils/searchExercises";

// api imports
import { leaderboard } from "./server/controllers/courses/leaderboard.ts";



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

// routes initiation
app.use("/users", userRoutes);
app.use("/courses", courseRoutes);
app.use("/exercises", exerciseRoutes);
app.use("/leaderboard", leaderboard);
app.use("/shop", shopItemRoutes)

app.use("/admin", adminRoutes)

// start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

import express, { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import cors from 'cors';
import mongoose from 'mongoose';
import { ZodError } from 'zod';



import User from './models/User.js';  
import Course from './models/Course.js';
import Exercise from './models/Exercise.js';
import CourseBatch from './models/CourseBatch.js';

import verifyTokenMiddleware from './middleware.js';

import { registerSchema, loginSchema } from './validators/auth.validators.js';
import { courseBatchSchema, courseBatchUpdateSchema } from './validators/courseBatch.validators.js';
import { courseSchema, courseUpdateSchema } from './validators/course.validators.js';
import { completeSchema } from './validators/progress.validators.js';
import { createExerciseSchema, updateExerciseSchema } from './validators/exercise.validators.js';
import { profileSchema } from './validators/profile.validators.js';


// load .env into process.env
dotenv.config();

// constants

// fill in the MongdoDB URI '' with your own values if needed

// fill in the JWT secret with your own value if needed

// when deployed, these values will be set by the host env
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
 * POST /register
 */
app.post(
  '/register',
  async (req: Request, res: Response): Promise<void> => {
    try {
      // validate request body with zod
      const validatedData = registerSchema.parse(req.body);
      const { username, password, confirm_password, email } = validatedData;

      // basic validation
      if (!username || !password || !confirm_password || !email) {
        res.status(400).json({ message: 'All fields are required' });
        return;
      }
      if (password !== confirm_password) {
        res.status(400).json({ message: 'Passwords do not match' });
        return;
      }

      // check duplicates
      const existingUser  = await User.findOne({ username });
      if (existingUser) {
        res.status(400).json({ message: 'Username already taken' });
        return;
      }
      const existingEmail = await User.findOne({ email });
      if (existingEmail) {
        res.status(400).json({ message: 'Email already registered' });
        return;
      }

      // hash & save
      const hashed = await bcrypt.hash(password, 10);

      const newUser = new User({ 
        username, 
        email, 
        password: hashed,
        dateCreated: new Date(),
        courseBatchesProgress: [],
        dateLastLogin: new Date(),
      });
      await newUser.save();

      res.status(201).json({ message: 'User registered successfully' });
      return;
    } catch (err) {
      console.error(err);
      const message = err instanceof Error ? err.message : 'An unknown error occurred';
      res.status(500).json({ error: message });
      return;
    }
})

/**
 * POST /login
 */
app.post(
  '/login',
  async (req: Request, res: Response): Promise<void> => {
    try {
      // validate request body with zod
      const validatedData = loginSchema.parse(req.body);
      const { username, password } = validatedData;

      // basic validation
      if (!username || !password) {
        res.status(400).json({ message: 'Username and password are required' });
        return;
      }

      // find user
      const user = await User.findOne({ username }).select('+password');
      if (!user) {
        res.status(401).json({ message: 'Invalid username or password' });
        return;
      }

      // check password
      const match = await bcrypt.compare(password, user.password);
      if (!match) {
        res.status(401).json({ message: 'Invalid username or password' });
        return;
      }

      // sign JWT
      const token = jwt.sign(
        { id: user.id, username: user.username },
        JWT_SECRET || 'default_secret',
        { expiresIn: EXPIRATION_TIME }
      );

      res.status(200).json({ message: 'Login successful', token });
      return;
    } catch (err) {
        console.error(err);
        const message = err instanceof Error ? err.message : 'An unknown error occurred';
        res.status(500).json({ error: message });
      return;
    }
})

/**
 * POST /addProfile
 */

app.put(
  '/addProfile',
  verifyTokenMiddleware,
  async (req: Request, res: Response): Promise<void> => {
    try {
      // validate request body with zod
      const validatedData = profileSchema.parse(req.body);
      const { userId, nickname, biodata, profilePicture } = validatedData;

      // find user
      const user = await User.findById(userId);
      if (!user) {
        res.status(404).json({ message: 'User not found' });
        return;
      }

      // update user profile
      user.nickname = nickname;
      user.biodata = biodata;
      user.profilePicture = profilePicture;
      user.dateUpdated = new Date();

      await user.save();

      res.status(200).json({ message: 'Profile created successfully', user });
      return;
    } catch (err) {
        console.error(err);
        const message = err instanceof Error ? err.message : 'An unknown error occurred';
        res.status(500).json({ error: message });
      return;
    }
  }
);

/**
 * GET /getProfile/:userId
 */

app.get(
  '/getProfile/:userId',
  verifyTokenMiddleware,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { userId } = req.params;

      // basic validation
      if (!userId) {
        res.status(400).json({ message: 'User ID is required' });
        return;
      }

      // find user
      const user = await User.findById(userId);
      if (!user) {
        res.status(404).json({ message: 'User not found' });
        return;
      }

      res.status(200).json({ message: 'Profile retrieved successfully', user });
      return;
    } catch (err) {
        console.error(err);
        const message = err instanceof Error ? err.message : 'An unknown error occurred';
        res.status(500).json({ error: message });
      return;
    }
  }
)


/**
 * GET /getUser:userId
 */
app.get('getUser/:userId', verifyTokenMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;

    // basic validation
    if (!userId) {
      res.status(400).json({ message: 'User ID is required' });
      return;
    }

    // find user
    const user = await User.findById({ _id: userId});
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    res.status(200).json({ message: 'User retrieved successfully', user });
    return;
  } catch (err) {
        console.error(err);
        const message = err instanceof Error ? err.message : 'An unknown error occurred';
        res.status(500).json({ error: message });
      return;
  }
})

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
async function genericSearch(
  model: any,
  validSearchKeys: string[],
  validSortKeys: string[],
  numericFields: string[],
  search: string,
  sort: string,
  pageNumber: number,
  pageSize: number
) {
  // Create a MongoDB query filter 
  let filter = {};
  
  if (search) {
    const [searchKey, searchValue] = search.split(':');
    
    // Validate search key
    if (!validSearchKeys.includes(searchKey)) {
      throw new Error(`Invalid search key. Allowed keys: ${validSearchKeys.join(', ')}`);
    }
    
    // Handle numeric fields differently
    if (numericFields.includes(searchKey)) {
      const numValue = parseInt(searchValue);
      if (isNaN(numValue)) {
        throw new Error(`${searchKey} must be a number`);
      }
      filter = { [searchKey]: numValue };
    } else {
      // Use regex for text fields
      filter = { [searchKey]: { $regex: searchValue, $options: 'i' } };
    }
  }

  // Get total count for pagination calculations
  const totalItems = await model.countDocuments(filter);
  
  // Prepare sort options
  let sortOptions = {};
  if (sort) {
    const [sortKey, sortOrder] = sort.toLowerCase().split(':');
    
    // Validate sort key
    if (!validSortKeys.includes(sortKey)) {
      throw new Error(`Invalid sort key. Allowed keys: ${validSortKeys.join(', ')}`);
    }
    
    // Validate sort order
    if (sortOrder !== 'asc' && sortOrder !== 'desc') {
      // Default to ascending if invalid
      sortOptions = { [sortKey]: 1 };
    } else {
      sortOptions = { [sortKey]: sortOrder === 'asc' ? 1 : -1 };
    }
  }

  // Calculate pagination values
  const totalPages = Math.ceil(totalItems / pageSize);
  const startIndex = (pageNumber - 1) * pageSize;
  
  // Get paginated results with filtering and sorting at database level
  const items = await model.find(filter)
    .sort(sortOptions)
    .skip(startIndex)
    .limit(pageSize);

  // Generate pagination metadata
  const hasNextPage = totalItems > startIndex + pageSize;
  const hasPreviousPage = startIndex > 0;
  const nextPage = hasNextPage ? pageNumber + 1 : null;
  const previousPage = hasPreviousPage ? pageNumber - 1 : null;
  
  return { items, totalItems, totalPages, nextPage, previousPage };
}

// For users
async function searchUsers(search: string, sort: string, pageNumber: number, pageSize: number) {
  const validSearchKeys = ['username', 'email', 'nickname'];
  const validSortKeys = ['username', 'email', 'nickname', 'dateCreated', 'xp', 'level'];
  const numericFields = ['xp', 'level'];
  
  const result = await genericSearch(
    User, 
    validSearchKeys, 
    validSortKeys, 
    numericFields,
    search, 
    sort, 
    pageNumber, 
    pageSize
  );
  
  // Rename the items to maintain backward compatibility
  return { 
    modifiedUsers: result.items, 
    totalUsers: result.totalItems,
    totalPages: result.totalPages,
    nextPage: result.nextPage,
    previousPage: result.previousPage
  };
}

// For courses
async function searchCourses(search: string, sort: string, pageNumber: number, pageSize: number) {
  const validSearchKeys = ['courseBatchId', 'title', 'level'];
  const validSortKeys = ['courseBatchId', 'title', 'level', 'dateCreated'];
  const numericFields = ['level'];
  
  const result = await genericSearch(
    Course, 
    validSearchKeys, 
    validSortKeys, 
    numericFields,
    search, 
    sort, 
    pageNumber, 
    pageSize
  );
  
  return { 
    courses: result.items, 
    totalCourses: result.totalItems,
    totalPages: result.totalPages,
    nextPage: result.nextPage,
    previousPage: result.previousPage
  };
}

// For exercises
async function searchExercises(search: string, sort: string, pageNumber: number, pageSize: number) {
  const validSearchKeys = ['exerciseId', 'courseId', 'courseBatchId', 'title', 'difficultyLevel', 'type'];
  const validSortKeys = ['exerciseId', 'courseId', 'title', 'difficultyLevel', 'dateCreated', 'type'];
  const numericFields = ['difficultyLevel'];
  
  const result = await genericSearch(
    Exercise, 
    validSearchKeys, 
    validSortKeys, 
    numericFields,
    search, 
    sort, 
    pageNumber, 
    pageSize
  );
  
  return { 
    exercises: result.items, 
    totalExercises: result.totalItems,
    totalPages: result.totalPages,
    nextPage: result.nextPage,
    previousPage: result.previousPage
  };
}

/**
 * GET /getUsers
 */
app.get(
  '/getUsers',
  verifyTokenMiddleware,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const pageSize = Number(req.query.page_size) || 10;
      const page = Number(req.query.page) || 1;
      const search = typeof req.query.search === 'string' ? req.query.search : '';
      const sort = typeof req.query.sort === 'string' ? req.query.sort : '';

      // Fixed destructuring to match the properties returned by searchUsers
      const {
        modifiedUsers: users, // renamed from modifiedUsers to users
        totalUsers: totalItems, // renamed from totalUsers to totalItems
        totalPages,
        nextPage,
        previousPage,
      } = await searchUsers(search, sort, page, pageSize);

      if (users.length === 0) {
        res.status(404).json({ message: 'No users found' });
        return;
      }

      res.status(200).json({
        message: 'Users retrieved successfully',
        users,
        totalItems,
        totalPages,
        nextPage,
        previousPage,
      });
    } catch (err) {
      console.error(err);
      const message = err instanceof Error ? err.message : 'An unknown error occurred';
      res.status(500).json({ error: message });
    }
  }
);

/**
 * POST /complete/:userId/:courseBatchId/:courseId/:exerciseId
 */
app.post(
  '/complete/:userId/:courseBatchId/:courseId/:exerciseId', 
  verifyTokenMiddleware, 
  async (req: Request, res: Response): Promise<void> => {
    try {
      // validate request body with zod
      const validatedData = completeSchema.parse(req.params);
      const {userId, courseBatchId, courseId, exerciseId} = validatedData;
      
      // Find the user first - we'll need the complete document
      const user = await User.findById(userId);
      if (!user) {
        res.status(404).json({ message: 'User not found' });
        return;
      }
      
      // Verify that all referenced entities exist
      const courseBatch = await CourseBatch.findOne({ courseBatchId: courseBatchId });
      if (!courseBatch) {
        res.status(404).json({ message: 'Course batch not found' });
        return;
      }

      const course = await Course.findOne({ courseId: courseId });
      if (!course) {
        res.status(404).json({ message: 'Course not found' });
        return;
      }
      
      const exercise = await Exercise.findOne({ exerciseId: exerciseId });
      if (!exercise) {
        res.status(404).json({ message: 'Exercise not found' });
        return;
      }

      // Find if the batch exists in user's progress
      const batchIndex = user.courseBatchesProgress.findIndex(
        (batch) => batch.courseBatchId === courseBatchId
      );
      const batchExists = batchIndex !== -1;
      
      // Find if the course exists within the specific batch
      let courseExists = false;
      let courseIndex = -1;
      if (batchExists) {
        courseIndex = user.courseBatchesProgress[batchIndex].courses.findIndex(
          (c) => c.courseId === courseId
        );
        courseExists = courseIndex !== -1;
      }
      
      // Find if the exercise exists within the specific course in the specific batch
      let exerciseExists = false;
      let exerciseIndex = -1;
      let alreadyCompleted = false;
      if (courseExists) {
        exerciseIndex = user.courseBatchesProgress[batchIndex].courses[courseIndex].exercises.findIndex(
          (e) => e.exerciseId === exerciseId
        );
        exerciseExists = exerciseIndex !== -1;
        
        // Check if already completed
        if (exerciseExists) {
          const exerciseStatus = user.courseBatchesProgress[batchIndex].courses[courseIndex].exercises[exerciseIndex].status;
          alreadyCompleted = exerciseStatus === 'completed';
        }
      }

      // Calculate XP based on difficulty (only if not already completed)
      let awardedXp = 0;
      if (!alreadyCompleted) {
        // Award XP based on difficulty level
        awardedXp = exercise.difficultyLevel * 10; // Base formula - adjust as needed
        
        // Add XP to user
        user.xp = (user.xp || 0) + awardedXp;
        
        // Check if user should level up (simple formula: level = 1 + floor(xp/100))
        const newLevel = Math.floor(1 + (user.xp / 100));
        if (newLevel > user.level) {
          user.level = newLevel;
        }
      }

      // Define objects as before
      const exercises = {
        exerciseId: exerciseId,
        status: 'completed',
        score: 0,
        lastAttempted: new Date()
      }

      const fullBeginnerBatchProgress = {
        courseBatchId: courseBatchId,
        status: 'in_progress',
        completedCoursesCount: 0,
        totalCoursesInBatch: courseBatch.courseList.length, 
        courses: [
          {
            courseId: courseId,
            status: 'in_progress',
            completedExercisesCount: 1, // Set to 1 since this exercise is completed
            totalExercisesInCourse: course.exerciseBatchList.length,
            exercises: [
              {
                exerciseId: exerciseId,
                status: 'completed',
                score: 0,
                lastAttempted: new Date()
              }
            ]
          }
        ]
      }

      const fullCourse = {
        courseId: courseId,
        status: 'in_progress', 
        completedExercisesCount: 1, // Set to 1 since this exercise is completed
        totalExercisesInCourse: course.exerciseBatchList.length,
        exercises: [
          {
            exerciseId: exerciseId,
            status: 'completed', 
            score: 0,
            lastAttempted: new Date()
          }
        ]
      }

      // Update based on what exists
      if (!batchExists) {
        // Add the new batch progress
        user.courseBatchesProgress.push(fullBeginnerBatchProgress);
        
        // Get the new indexes since we just added items
        const newBatchIndex = user.courseBatchesProgress.length - 1;
        
        // Check if course is now complete
        const totalExercises = course.exerciseBatchList.length;
        const completedExercises = user.courseBatchesProgress[newBatchIndex].courses[0].completedExercisesCount;
        
        if (completedExercises >= totalExercises) {
          // Mark course as completed
          user.courseBatchesProgress[newBatchIndex].courses[0].status = 'completed';
          
          // Increment completed courses count for the batch
          user.courseBatchesProgress[newBatchIndex].completedCoursesCount += 1;
          
          // Check if batch is now complete
          const totalCourses = courseBatch.courseList.length;
          const completedCourses = user.courseBatchesProgress[newBatchIndex].completedCoursesCount;
          
          if (completedCourses >= totalCourses) {
            // Mark batch as completed
            user.courseBatchesProgress[newBatchIndex].status = 'completed';
          }
        }
      } else if (!courseExists) {
        // Add the new course to existing batch
        user.courseBatchesProgress[batchIndex].courses.push(fullCourse);
        
        // Get the new course index since we just added it
        const newCourseIndex = user.courseBatchesProgress[batchIndex].courses.length - 1;
        
        // Check if course is now complete
        const totalExercises = course.exerciseBatchList.length;
        const completedExercises = user.courseBatchesProgress[batchIndex].courses[newCourseIndex].completedExercisesCount;
        
        if (completedExercises >= totalExercises) {
          // Mark course as completed
          user.courseBatchesProgress[batchIndex].courses[newCourseIndex].status = 'completed';
          
          // Increment completed courses count for the batch
          user.courseBatchesProgress[batchIndex].completedCoursesCount += 1;
          
          // Check if batch is now complete
          const totalCourses = courseBatch.courseList.length;
          const completedCourses = user.courseBatchesProgress[batchIndex].completedCoursesCount;
          
          if (completedCourses >= totalCourses) {
            // Mark batch as completed
            user.courseBatchesProgress[batchIndex].status = 'completed';
          }
        }
      } else if (!exerciseExists) {
        // Add the new exercise to existing course
        user.courseBatchesProgress[batchIndex].courses[courseIndex].exercises.push(exercises);
        
        // Update completion counts if this is a new completion (and we already have batch and course)
        if (batchExists && courseExists) {
          // Increment completed exercises count for this course
          user.courseBatchesProgress[batchIndex].courses[courseIndex].completedExercisesCount += 1;
          
          // Check if course is now complete
          const totalExercises = course.exerciseBatchList.length;
          const completedExercises = user.courseBatchesProgress[batchIndex].courses[courseIndex].completedExercisesCount;
          
          if (completedExercises >= totalExercises) {
            // Mark course as completed
            user.courseBatchesProgress[batchIndex].courses[courseIndex].status = 'completed';
            
            // Increment completed courses count for the batch
            user.courseBatchesProgress[batchIndex].completedCoursesCount += 1;
            
            // Check if batch is now complete
            const totalCourses = courseBatch.courseList.length;
            const completedCourses = user.courseBatchesProgress[batchIndex].completedCoursesCount;
            
            if (completedCourses >= totalCourses) {
              // Mark batch as completed
              user.courseBatchesProgress[batchIndex].status = 'completed';
            }
          }
        }
      } else if (!alreadyCompleted) {
        // Update existing exercise if not already completed
        user.courseBatchesProgress[batchIndex].courses[courseIndex].exercises[exerciseIndex].status = 'completed';
        user.courseBatchesProgress[batchIndex].courses[courseIndex].exercises[exerciseIndex].lastAttempted = new Date();
        
        // Update completion counts (we know batch and course exist since we're updating an exercise)
        // Increment completed exercises count for this course
        user.courseBatchesProgress[batchIndex].courses[courseIndex].completedExercisesCount += 1;
        
        // Check if course is now complete
        const totalExercises = course.exerciseBatchList.length;
        const completedExercises = user.courseBatchesProgress[batchIndex].courses[courseIndex].completedExercisesCount;
        
        if (completedExercises >= totalExercises) {
          // Mark course as completed
          user.courseBatchesProgress[batchIndex].courses[courseIndex].status = 'completed';
          
          // Increment completed courses count for the batch
          user.courseBatchesProgress[batchIndex].completedCoursesCount += 1;
          
          // Check if batch is now complete
          const totalCourses = courseBatch.courseList.length;
          const completedCourses = user.courseBatchesProgress[batchIndex].completedCoursesCount;
          
          if (completedCourses >= totalCourses) {
            // Mark batch as completed
            user.courseBatchesProgress[batchIndex].status = 'completed';
          }
        }
      }

    // Default to 0 for course progress
    let courseProgress = 0;

    // Only calculate course progress if both batch and course exist
    if (batchExists && courseExists) {
      courseProgress = user.courseBatchesProgress[batchIndex].courses[courseIndex].completedExercisesCount / 
                      user.courseBatchesProgress[batchIndex].courses[courseIndex].totalExercisesInCourse;
    }

    // Updating course progress if batch exists but course does not
    if (!batchExists) {
      const newBatchIndex = user.courseBatchesProgress.length - 1;
      courseProgress = user.courseBatchesProgress[newBatchIndex].courses[0].completedExercisesCount / 
                      user.courseBatchesProgress[newBatchIndex].courses[0].totalExercisesInCourse;
    } else if (!courseExists) {
      const newCourseIndex = user.courseBatchesProgress[batchIndex].courses.length - 1;
      courseProgress = user.courseBatchesProgress[batchIndex].courses[newCourseIndex].completedExercisesCount / 
                      user.courseBatchesProgress[batchIndex].courses[newCourseIndex].totalExercisesInCourse;
    }

      // Mark as modified and save the user document
      user.markModified('courseBatchesProgress');
      user.markModified('xp');
      user.markModified('level');
      await user.save();
      
      res.status(200).json({ 
        message: 'Exercise completed successfully', 
        awardedXp,
        currentXp: user.xp,
        level: user.level,
        alreadyCompleted,
        exerciseStatus: {
          courseBatchId: courseBatchId,
          courseId: courseId,
          exerciseId: exerciseId,
          status: 'completed'
        },
        courseProgress: courseProgress
      });
      return;
    }
    catch (err) {
      console.error(err);
      const message = err instanceof Error ? err.message : 'An unknown error occurred';
      res.status(500).json({ error: message });
      return;
    }
  }
);



/**
 * GET /leaderboard
 */
app.get(
  '/leaderboard', verifyTokenMiddleware,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const leaderboard = await User.find().sort({ xp: -1 }).limit(10);
      res.status(200).json({ message: 'Leaderboard retrieved successfully', leaderboard });
      return;
    } catch (err) {
        console.error(err);
        const message = err instanceof Error ? err.message : 'An unknown error occurred';
        res.status(500).json({ error: message });
      return;
    }
  }
)


/**
 * POST /createCourseBatch
 */

app.post (
  '/createCourseBatch',
  verifyTokenMiddleware,
  async (req: Request, res: Response): Promise<void> => {
  try {
    // validate request body
    const validatedData = courseBatchSchema.parse(req.body);
    const { courseBatchId, stage } = validatedData;

    // basic validation
    if (!courseBatchId) {
      res.status(400).json({ message: 'Course batch ID is required' });
      return;
    }
    // check if courseBatchId already exists in the database
    const existingCourseBatch = await CourseBatch.findOne({ courseBatchId: courseBatchId });
    if (existingCourseBatch) {
      res.status(400).json({ message: 'Course batch ID already exists' });
      return;
    }

    const courseList: string[] = [];

    // check how many courses are in the course database
    const coursesLength: number = courseList.length;

    const courseBatch = new CourseBatch({
      courseBatchId,
      dateCreated: new Date(),
      courseList: courseList,
      stage: stage,
      coursesLength
    });
    await courseBatch.save();

    res.status(200).json({ message: 'Course batch created successfully', courseBatch });

  }
  catch (err) {
    console.error(err);
    const message = err instanceof Error ? err.message : 'An unknown error occurred';
    res.status(500).json({ error: message });
  }
}
)

/**
 * GET /getCourseBatches
 */

app.get(
  '/getCourseBatches',
  async (req: Request, res: Response): Promise<void> => {
    try {
      const courseBatches = await CourseBatch.find();
      
      if (!courseBatches || courseBatches.length === 0) {
        res.status(404).json({ message: 'No course batches found' });
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
          coursesLength: courseBatch.coursesLength
        });
      });

      res.status(200).json({ message: 'Course batches retrieved successfully', courseBatchList });
      return;
    } catch (err) {
        console.error(err);
        const message = err instanceof Error ? err.message : 'An unknown error occurred';
        res.status(500).json({ error: message });
      return;
    }
  });

/**
 * GET /getCourseBatch/:courseBatchId
 */

app.get(
  '/getCourseBatch/:courseBatchId', async (req: Request, res: Response): Promise<void> => {
    try {
      const { courseBatchId } = req.params;

      // basic validation
      if (!courseBatchId) {
        res.status(400).json({ message: 'Course batch ID is required' });
        return;
      }

      // find course batch
      const courseBatch = await CourseBatch.findOne({ courseBatchId: courseBatchId });
      if (!courseBatch) {
        res.status(404).json({ message: `Course batch with Course Batch ID ${courseBatchId} not found.` });
        return;
      }

      res.status(200).json({ message: 'Course batch retrieved successfully', courseBatch });
      return;
    }
    catch (err) {
        console.error(err);
        const message = err instanceof Error ? err.message : 'An unknown error occurred';
        res.status(500).json({ error: message });
      return;
    }
})


/**
 * PUT /updateCourseBatch
 */

app.put('/updateCourseBatch', verifyTokenMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const validatedData = courseBatchUpdateSchema.parse(req.body);
    const { courseBatchId, stage } = validatedData;

    // basic validation
    if (!courseBatchId) {
      res.status(400).json({ message: 'Course batch ID is required' });
      return;
    }

    // find course batch
    const courseBatch = await CourseBatch.findOne({ courseBatchId: courseBatchId });
    if (!courseBatch) {
      res.status(404).json({ message: 'Course batch not found' });
      return;
    }
    
    // update the date
    const newDate = new Date();

    courseBatch.stage = stage;
    courseBatch.dateCreated = newDate;
    await courseBatch.save();

    res.status(200).json({ message: 'Course batch updated successfully', courseBatch });
  } catch (err) {
        console.error(err);
        const message = err instanceof Error ? err.message : 'An unknown error occurred';
        res.status(500).json({ error: message });
      return;
  }
}
);

/**
 * DELETE /deleteCourseBatch
 */

app.delete(
  '/deleteCourseBatch',
  verifyTokenMiddleware,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { courseBatchId } = req.body;

      // basic validation
      if (!courseBatchId) {
        res.status(400).json({ message: 'Course batch ID is required' });
        return;
      }

      // find course batch
      const existingCourseBatch = await CourseBatch.findOne({ courseBatchId: courseBatchId });
      if (!existingCourseBatch) {
        res.status(404).json({ message: `Course batch with Course Batch ID ${courseBatchId} not found` });
        return;
      }

      // delete course batch
      await CourseBatch.deleteOne({ courseBatchId : courseBatchId });

      res.status(200).json({ message: 'Course batch deleted successfully' });
      return;
    } catch (err) {
        console.error(err);
        const message = err instanceof Error ? err.message : 'An unknown error occurred';
        res.status(500).json({ error: message });
      return;
    }
  }
);


/**
 * POST /createCourse
 */

app.post(
  '/createCourse',
  verifyTokenMiddleware,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const validatedData = courseSchema.parse(req.body);
      const { courseBatchId, courseId, title, level } = validatedData;

      // basic validation
      if (!courseBatchId) {
        res.status(400).json({ message: 'Course batch ID is required' });
        return;
      }

      if (!courseId) {
        res.status(400).json({ message: 'Course ID is required' });
        return;
      }
      if (!level) {
        res.status(400).json({ message: 'Level is required' });
        return;
      }

      // check if courseBatchId already exists in the database
      const existingCourseBatch = await CourseBatch.findOne({ courseBatchId: courseBatchId });
      if (!existingCourseBatch) {
        res.status(404).json({ message: 'Course batch not found' });
        return;
      }

      // find course
      const courseFind = await Course.findOne({courseId: courseId});
      if (courseFind) {
        res.status(404).json({ message: 'Course is already in the database' });
        return;
      }

      // push courseId to courseList in courseBatch
      existingCourseBatch.courseList.push(courseId);
      existingCourseBatch.coursesLength += 1;
      await existingCourseBatch.save();

      // create date
      const dateCreated = new Date();
      
      // exercises length
      const exerciseBatchList: string[] = [];

      // check how many exercises are in the exercise database
      const exercisesLength = exerciseBatchList.length;

      // create course
      const course = new Course({
        courseBatchId,
        courseId,
        title,
        level,
        dateCreated,
        exerciseBatchList,
        exercisesLength
      });
      await course.save();

      res.status(200).json({ message: 'Course created.', course });
      return;
    } catch (err) {
        console.error(err);
        const message = err instanceof Error ? err.message : 'An unknown error occurred';
        res.status(500).json({ error: message });
      return;
    }
  }
);

/**
 * GET /getCourses
 */ 
app.get(
  '/getCourses',
  async (req: Request, res: Response): Promise<void> => {
    try {
      const pageSize = Number(req.query.page_size) || 10;
      const page = Number(req.query.page) || 1;
      const search = typeof req.query.search === 'string' ? req.query.search : '';
      const sort = typeof req.query.sort === 'string' ? req.query.sort : '';

      const {
        courses,
        totalCourses,
        totalPages,
        nextPage,
        previousPage,
      } = await searchCourses(search, sort, page, pageSize);
      
      if (!courses || courses.length === 0) {
        res.status(404).json({ message: 'No courses found' });
        return;
      }

      interface CourseItem {
        courseBatchId: string;
        courseId: string; 
        title: string;
        level: number; 
        dateCreated: Date | string; 
        exerciseBatchList: string[]; 
        exercisesLength: number;
      }
      
      const courseList: CourseItem[] = [];

      courses.forEach((course: any) => {
        courseList.push({
          courseBatchId: course.courseBatchId,
          courseId: course.courseId,
          title: course.title,
          level: course.level,
          dateCreated: course.dateCreated,
          exerciseBatchList: course.exerciseBatchList, 
          exercisesLength: course.exercisesLength
        });
      });

      res.status(200).json({ 
        message: 'Courses retrieved successfully', 
        courseList,
        totalItems: totalCourses,
        totalPages,
        currentPage: page,
        nextPage,
        previousPage
      });
      return;
    } catch (err) {
        console.error(err);
        const message = err instanceof Error ? err.message : 'An unknown error occurred';
        res.status(500).json({ error: message });
      return;
    }
  });

/**
 * GET /getCourse/:courseId
 */
app.get(
  '/getCourse/:courseId',
  async (req: Request, res: Response): Promise<void> => {
    try{
      const { courseId } = req.params;

      // basic validation
      if (!courseId) {
        res.status(400).json({ message: 'Course ID is required' });
        return;
      }

      // find course
      const course = await Course.findOne({ courseId: courseId });
      if (!course) {
        res.status(404).json({ message: `Course with Course ID ${courseId} not found.` });
        return;
      }

      res.status(200).json({ message: 'Course retrieved successfully', course });
      return;
    }
    catch (err) {
        console.error(err);
        const message = err instanceof Error ? err.message : 'An unknown error occurred';
        res.status(500).json({ error: message });
      return;
    }
  })


/**
 * PUT /updateCourse 
 */
app.put(
  '/updateCourse',
  verifyTokenMiddleware,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const validatedData = courseUpdateSchema.parse(req.body);
      const { courseBatchId, courseId, title, level } = validatedData;

      // basic validation
      if (!courseId) {
        res.status(400).json({ message: 'Course ID is required' });
        return;
      }

      // find course
      const course = await Course.findOne({courseId: courseId});
      if (!course) {
        res.status(404).json({ message: `Course with course ID ${course} not found.` });
        return;
      }

      // check if courseBatchId already exists in the database
      const existingCourseBatch = await CourseBatch.findOne({ courseBatchId: courseBatchId });
      if (!existingCourseBatch) {
        res.status(404).json({ message: 'Course batch not found' });
        return;
      }

      // create new current date
      const dateCreated = new Date();

      // update course
      course.title = title;
      course.level = level;
      course.dateCreated = dateCreated;
      await course.save();

      res.status(200).json({ message: 'Course updated successfully', course });
      return;
    } catch (err) {
        console.error(err);
        const message = err instanceof Error ? err.message : 'An unknown error occurred';
        res.status(500).json({ error: message });
      return;
    }
  }
);

/**
 * DELETE /deleteCourse
 */ 

app.delete(
  '/deleteCourse',
  verifyTokenMiddleware,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { courseId, courseBatchId } = req.body;

      // basic validation
      if (!courseId) {
        res.status(400).json({ message: 'Course ID is required' });
        return;
      }

      // find course
      const existingCourse = await Course.findOne({courseId: courseId});
      if (!existingCourse) {
        res.status(404).json({ message: `Course with Course ID ${courseId} not found` });
        return;
      }

      const existingCourseBatch = await CourseBatch.findOne({ courseBatchId: courseBatchId });
      if (!existingCourseBatch) {
        res.status(404).json({ message: `Course batch with Course Batch ID ${courseBatchId} not found` });
        return;
      }

      // delete courseId from courseList in courseBatch
      existingCourseBatch.courseList = existingCourseBatch.courseList.filter((course) => course !== courseId);
      if (existingCourseBatch.coursesLength > 0) {
        existingCourseBatch.coursesLength -= 1;
      }
      await existingCourseBatch.save();

      // delete course
      await Course.deleteOne({ courseId : courseId });

      res.status(200).json({ message: 'Course deleted successfully' });
      return;
    } catch (err) {
        console.error(err);
        const message = err instanceof Error ? err.message : 'An unknown error occurred';
        res.status(500).json({ error: message });
      return;
    }
  }
)

/**
 * POST /createExercise
 */

app.post( 
  '/createExercise', 
  verifyTokenMiddleware, // Assuming exercise creation requires authentication
  async (req: Request, res: Response): Promise<void> => {
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
      answer
    } = validatedData;

    // Check if exerciseId already exists
    const existingExercise = await Exercise.findOne({ exerciseId });
    if (existingExercise) {
      res.status(400).json({ message: 'Exercise ID already exists' });
      return;
    }

    // Check if the referenced courseId exists
    const existingCourse = await Course.findOne({ courseId });
    if (!existingCourse) {
      res.status(404).json({ message: `Course with ID ${courseId} not found.` });
      return;
    }

    // Check if the referenced courseBatchId exists
    const existingCourseBatch = await CourseBatch.findOne({ courseBatchId });
    if (!existingCourseBatch) {
      res.status(404).json({ message: `CourseBatch with ID ${courseBatchId} not found.` });
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
      answer
    });

    await newExercise.save();

    res.status(201).json({ message: 'Exercise created successfully', exercise: newExercise });
    return;

  } catch (err) {
    console.error(err);
    if (err instanceof ZodError) {
      res.status(400).json({ message: "Validation failed", errors: err.errors });
      return;
    }
    const message = err instanceof Error ? err.message : 'An unknown error occurred';
    res.status(500).json({ error: message });
    return;
  }
})

/**
 * GET /getExercise/:exerciseId
 */
app.get(
  '/getExercise/:exerciseId',
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { exerciseId } = req.params;
      // basic validation
      if (!exerciseId) {
        res.status(400).json({ message: 'Exercise ID is required' });
        return;
      }
      // find exercise
      const exercise = await Exercise.findOne({ exerciseId: exerciseId });
      if (!exercise) {
        res.status(404).json({ message: `Exercise with Exercise ID ${exerciseId} not found` });
        return;
      }
      res.status(200).json({ message: 'Exercise retrieved successfully', exercise });
      return;
    }
    catch (err) {
        console.error(err);
        const message = err instanceof Error ? err.message : 'An unknown error occurred';
        res.status(500).json({ error: message });
      return;
    }
  }
)


/**
 * GET /getExercises
 */ 
app.get(
  '/getExercises',
  async (req: Request, res: Response): Promise<void> => {
    try {
      const pageSize = Number(req.query.page_size) || 10;
      const page = Number(req.query.page) || 1;
      const search = typeof req.query.search === 'string' ? req.query.search : '';
      const sort = typeof req.query.sort === 'string' ? req.query.sort : '';

      const {
        exercises,
        totalExercises,
        totalPages,
        nextPage,
        previousPage,
      } = await searchExercises(search, sort, page, pageSize);
      
      if (!exercises || exercises.length === 0) {
        res.status(404).json({ message: 'No exercises found' });
        return;
      }

      res.status(200).json({ 
        message: 'Exercises retrieved successfully', 
        exercises,
        totalItems: totalExercises,
        totalPages,
        currentPage: page,
        nextPage,
        previousPage
      });
      return;
    } catch (err) {
      console.error(err);
      const message = err instanceof Error ? err.message : 'An unknown error occurred';
      res.status(500).json({ error: message });
      return;
    }
  });

/**
 * PUT /updateExercise
 */
app.put(
  '/updateExercise',
  verifyTokenMiddleware,
  async (req: Request, res: Response): Promise<void> => {
  try {
    const validatedData = updateExerciseSchema.parse(req.body);
    const { exerciseId, courseId, courseBatchId, title, difficultyLevel, animType, type, question, options, answer } = validatedData;

    // basic validation
    if (!exerciseId) {
      res.status(400).json({ message: 'Exercise ID is required' });
      return;
    }

    // find exercise
    const exercise = await Exercise.findOne({ exerciseId: exerciseId });
    if (!exercise) {
      res.status(404).json({ message: `Exercise with Exercise ID ${exerciseId} not found` });
      return;
    }

    // check if courseId already exists in the database
    const existingCourse = await Course.findOne({ courseId: courseId });
    if (!existingCourse) {
      res.status(404).json({ message: 'Course not found' });
      return;
    }

    // check if courseBatchId already exists in the database
    const existingCourseBatch = await CourseBatch.findOne({ courseBatchId: courseBatchId });
    if (!existingCourseBatch) {
      res.status(404).json({ message: 'Course batch not found' });
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
    
    res.status(200).json({ message: 'Exercise updated successfully', exercise });
  } catch (err) {
        console.error(err);
        const message = err instanceof Error ? err.message : 'An unknown error occurred';
        res.status(500).json({ error: message });
      return;
  }
  }
)

/**
 * DELETE /deleteExercise
*/
app.delete(
  '/deleteExercise', verifyTokenMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const { exerciseId, courseId } = req.body;

    // basic validation
    if (!exerciseId) {
      res.status(400).json({ message: 'Exercise ID is required' });
      return;
    }

    const existingCourse = await Course.findOne({ courseId: courseId });
    if (!existingCourse) {
      res.status(404).json({ message: `Course with Course ID ${courseId} not found` });
      return;
    }

    // find exercise
    const exercise = await Exercise.findOne({ exerciseId: exerciseId });
    if (!exercise) {
      res.status(404).json({ message: `Exercise with Exercise ID ${exerciseId} not found` });
      return;
    }

    // delete exerciseId from exerciseBatchList in course
    existingCourse.exerciseBatchList = existingCourse.exerciseBatchList.filter((exercise) => exercise !== exerciseId);
    if (existingCourse.exercisesLength > 0) {
      existingCourse.exercisesLength -= 1;
    }
    await existingCourse.save();

    // delete exercise
    await Exercise.deleteOne({ exerciseId : exerciseId });

    res.status(200).json({ message: 'Exercise deleted successfully' });
    return;
  }
  catch (err) {
    console.error(err);
    const message = err instanceof Error ? err.message : 'An unknown error occurred';
    res.status(500).json({ error: message });
    return;
  }
}
)

app.put(
  '/updateExercise',verifyTokenMiddleware, async (req: Request, res: Response): Promise<void> => {
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
      answer
    } = validatedData;

    // basic validation
    if (!exerciseId) {
      res.status(400).json({ message: 'Exercise ID is required' });
      return;
    }
    // find exercise
    const exercise = await Exercise.findOne({ exerciseId: exerciseId });
    if (!exercise) {
      res.status(404).json({ message: `Exercise with Exercise ID ${exerciseId} not found` });
      return;
    }

    // check if courseId already exists in the database
    const existingCourse = await Course.findOne({ courseId: courseId });
    if (!existingCourse) {
      res.status(404).json({ message: 'Course not found' });
      return;
    }

    // check if courseBatchId already exists in the database
    const existingCourseBatch = await CourseBatch.findOne({ courseBatchId: courseBatchId });
    if (!existingCourseBatch) {
      res.status(404).json({ message: 'Course batch not found' });
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
    res.status(200).json({ message: 'Exercise updated successfully', exercise });
    return;
  } catch (err) {
    console.error(err);
    if (err instanceof ZodError) {
      res.status(400).json({ message: "Validation failed", errors: err.errors });
      return;
    }
    const message = err instanceof Error ? err.message : 'An unknown error occurred';
    res.status(500).json({ error: message });
    return;
  }
}
)


// start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

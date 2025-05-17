import express, { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import cors from 'cors';
import mongoose from 'mongoose';

import User from './models/User.js';  
import Course from './models/Course.js';
import Exercise from './models/Exercise.js';

import { registerSchema, loginSchema } from './validators/auth.validators.js';
import { courseBatchSchema } from './validators/courseBatch.validators.js';
import { courseSchema } from './validators/course.validators.js';

// load .env into process.env
dotenv.config();

// constants
const PORT: number = process.env.PORT ? Number(process.env.PORT) : 3000;
const MONGO_URI: string | undefined = process.env.MONGO_URI || 'mongodb://localhost:27017/myapp';
const JWT_SECRET = process.env.JWT_SECRET;

const EXPIRATION_TIME: string = process.env.EXPIRATION_TIME || '1h'; // default to 1 hour

// connect to MongoDB
mongoose
  .connect(MONGO_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });

const app = express();

app.use(cors({
  origin: '*',
  methods: ['GET','POST','PUT','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization']
}));
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
        password: hashed 
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
  }
);

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
      const user = await User.findOne({ username });
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
        { expiresIn: '1h' }
      );

      res.status(200).json({ message: 'Login successful', token });
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
 * GET /verifyToken
 */
app.get(
  '/verifyToken',
  async (req: Request, res: Response): Promise<void> => {
    try {
      const token = req.headers['authorization']?.split(' ')[1];

      if (!token) {
        res.status(401).json({ message: 'Token is required' });
        return;
      }

      jwt.verify(token, JWT_SECRET || 'default_secret', (err, decoded) => {
        if (err) {
          res.status(401).json({ message: 'Invalid token' });
          return;
        }
        res.status(200).json({ message: 'Token is valid', decoded });
        return;
      });
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
app.get('getUser/:userId', async (req: Request, res: Response): Promise<void> => {
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
 * GET /getUsers
 */
app.get(
  '/getUsers',
  async (req: Request, res: Response): Promise<void> => {
    try {
      const users = await User.find();
      
      if (!users || users.length === 0) {
        res.status(404).json({ message: 'No users found' });
        return;
      }

      interface UserItem {
        username: string; 
        email: string; 
        xp: number; 
        level: number;
      }
      

      const userList: UserItem[] = [];

      users.forEach((user) => {
        userList.push({
          username: user.username,
          email: user.email,
          xp: user.xp,
          level: user.level
        });
      });

      res.status(200).json({ message: 'Users retrieved successfully', userList });
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
 * GET /leaderboard
 */
app.get(
  '/leaderboard',
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
  async (req: Request, res: Response): Promise<void> => {
  try {
    // validate request body
    const validatedData = courseBatchSchema.parse(req.body);
    const { courseBatchId, courseList, stage } = validatedData;

    // basic validation
    if (!courseBatchId) {
      res.status(400).json({ message: 'Course batch ID is required' });
      return;
    }
    if (!courseList || courseList.length === 0) {
      res.status(400).json({ message: 'Courses are required' });
      return;
    }
    // check if courseBatchId already exists in the database
    const existingCourseBatch = await Course.findOne({ courseBatchId: courseBatchId });
    if (existingCourseBatch) {
      res.status(400).json({ message: 'Course batch ID already exists' });
      return;
    }

    const courseBatch = new Course({
      courseBatchId,
      dateCreated: new Date(),
      courseList: courseList,
      stage: stage
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
 * POST /createCourse
 */

app.post(
  '/createCourse',
  async (req: Request, res: Response): Promise<void> => {
    try {
      const validatedData = courseSchema.parse(req.body);
      const { courseId, level, exerciseBatchList } = validatedData;


      // basic validation
      if (!courseId) {
        res.status(400).json({ message: 'Course ID is required' });
        return;
      }
      if (!level) {
        res.status(400).json({ message: 'Level is required' });
        return;
      }

      if (!exerciseBatchList) {
        res.status(400).json({ message: 'Exercise batch is required' });
        return;
      }
      // find course
      const courseFind = await Course.findOne({courseId: courseId});
      if (courseFind) {
        res.status(404).json({ message: 'Course is already in the database' });
        return;
      }

      // create date
      const dateCreated = new Date();

      // create course
      const course = new Course({
        courseId,
        level,
        dateCreated,
        exerciseBatchList
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
      const courses = await Course.find();
      
      if (!courses || courses.length === 0) {
        res.status(404).json({ message: 'No courses found' });
        return;
      }

      interface CourseItem {
        courseId: string; 
        level: string | number; 
        dateCreated: Date | string; 
        exerciseBatchList: string[]; 
      }
      

      const courseList: CourseItem[] = [];

      courses.forEach((course) => {
        courseList.push({
          courseId: course.courseId,
          level: course.level,
          dateCreated: course.dateCreated,
          exerciseBatchList: course.exerciseBatchList 
        });
      });

      res.status(200).json({ message: 'Courses retrieved successfully', courseList });
      return;
    } catch (err) {
        console.error(err);
        const message = err instanceof Error ? err.message : 'An unknown error occurred';
        res.status(500).json({ error: message });
      return;
    }
  });

/**
 * GET /getCourses/:courseId
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
        res.status(404).json({ message: 'Course not found' });
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
 * POST /updateCourse 
 */

app.post(
  '/updateCourse',
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { courseId, level, dateCreated, exerciseBatchList } = req.body;

      // basic validation
      if (!courseId) {
        res.status(400).json({ message: 'Course ID is required' });
        return;
      }

      // find course
      const course = await Course.findById(courseId);
      if (!course) {
        res.status(404).json({ message: 'Course not found' });
        return;
      }

      // update course
      course.level = level;
      course.dateCreated = dateCreated;
      course.exerciseBatchList = exerciseBatchList;
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
 * POST /deleteCourse
 */ 

app.delete(
  '/deleteCourse',
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { courseId } = req.body;

      // basic validation
      if (!courseId) {
        res.status(400).json({ message: 'Course ID is required' });
        return;
      }

      // find course
      const course = await Course.findOne({courseId: courseId});
      if (!course) {
        res.status(404).json({ message: 'Course not found' });
        return;
      }

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
 * POST /createExercises
 */

app.post( '/createExercise', async (req: Request, res: Response): Promise<void> => {
  try {
    const {exerciseId, animtype, courseId, type, difficultyLevel, question, answer } = req.body;

    if (!exerciseId || !animtype || !courseId || !type || !difficultyLevel || !question || !answer) {
      res.status(400).json({ message: 'All fields are required' });
      return;
    }
    // check if exerciseId already exists
    const existingExercise = await Exercise.findOne({ exerciseId });
    if (existingExercise) {
      res.status(400).json({ message: 'Exercise ID already exists' });
      return;
    }

    // unfinished code
    / will be used to check if exerciseId has a corresponding courseId  
    const exerciseIdCompare = exerciseId;
  
    
   
    if(!animtype) {
      return;
    }


  }
  catch (err) {
    console.error(err);
    const message = err instanceof Error ? err.message : 'An unknown error occurred';
    res.status(500).json({ error: message });
    return;
  }
})






// start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

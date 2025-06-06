import { Request, Response } from "express";
import Course from "../../models/Course.js";
import CourseBatch from "../../models/CourseBatch.js";
import { courseSchema } from "../../validators/course.validators.js";
import sharp from "sharp"; // Add this import

export const createCourse = async (
  req: Request,
  res: Response,
): Promise<Response | void> => {
  try {
    const validatedData = courseSchema.parse(req.body);
    const { courseBatchId, courseId, title, logo, level } = validatedData;

    // basic validation
    if (!courseBatchId) {
      res.status(400).json({ message: "Course batch ID is required" });
      return;
    }

    if (!courseId) {
      res.status(400).json({ message: "Course ID is required" });
      return;
    }
    if (!level) {
      res.status(400).json({ message: "Level is required" });
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

    // find course
    const courseFind = await Course.findOne({ courseId: courseId });
    if (courseFind) {
      res.status(404).json({ message: "Course is already in the database" });
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

    // Process logo if it exists
    let logoData = null;
    if (logo) {
      try {
        // Extract the base64 data and content type
        const matches = logo.match(/^data:([A-Za-z-+/]+);base64,(.+)$/);
        
        if (matches && matches.length === 3) {
          const base64Data = matches[2];
          const buffer = Buffer.from(base64Data, 'base64');
          
          // Resize and optimize the logo using sharp
          const resizedImageBuffer = await sharp(buffer)
            .resize(400, 400, { 
              fit: 'contain',
              background: { r: 0, g: 0, b: 0, alpha: 0 } // Transparent background
            })
            .png({ quality: 90 })
            .toBuffer();
          
          // Prepare logo data
          logoData = {
            data: resizedImageBuffer,
            contentType: 'image/png'
          };
        }
      } catch (error) {
        console.error("Error processing logo image:", error);
        return res.status(400).json({ error: "Invalid logo image data" });
      }
    }

    // create course
    const course = new Course({
      courseBatchId,
      courseId,
      title,
      level,
      dateCreated,
      exerciseBatchList,
      exercisesLength,
      logo: logoData, 
    });
    await course.save();

    // Format response - convert binary logo back to base64 for response
    const courseObject = course.toObject();
    const courseResponse = {
    ...courseObject,
    logo: courseObject.logo && courseObject.logo.data 
      ? `data:${courseObject.logo.contentType};base64,${courseObject.logo.data.toString('base64')}`
      : null
    };

    res.status(200).json({ message: "Course created.", course: courseResponse });
    return;
  } catch (err) {
    console.error(err);
    const message =
      err instanceof Error ? err.message : "An unknown error occurred";
    res.status(500).json({ error: message });
    return;
  }
};
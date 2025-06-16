import { Request, Response } from "express";
import Course from "../../models/Course";
import CourseBatch from "../../models/CourseBatch";
import { courseUpdateSchema } from "../../validators/course.validators";
import sharp from "sharp"; // Add this import

export const updateCourse = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const validatedData = courseUpdateSchema.parse(req.body);
    const { courseBatchId, courseId, title, level, logo } = validatedData;

    // basic validation
    if (!courseId) {
      res.status(400).json({ message: "Course ID is required" });
      return;
    }

    // find course
    const course = await Course.findOne({ courseId: courseId });
    if (!course) {
      res
        .status(404)
        .json({ message: `Course with course ID ${courseId} not found.` });
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

    // Process logo if it exists and has changed
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
          
          // Store the optimized binary data and content type
          course.logo = {
            data: resizedImageBuffer,
            contentType: 'image/png'
          };
        }
      } catch (error) {
        console.error("Error processing logo image:", error);
        res.status(400).json({ error: "Invalid logo image data" });
        return;
      }
    }

    // create new current date
    const dateCreated = new Date();

    // update course
    course.title = title;
    course.level = level;
    course.dateCreated = dateCreated;
    await course.save();

    // Format response - convert binary logo back to base64 for response
    const courseObject = course.toObject();
    
    const courseResponse = {
    ...courseObject,
    logo: courseObject.logo && courseObject.logo.data 
      ? `data:${courseObject.logo.contentType};base64,${courseObject.logo.data.toString('base64')}`
      : null
  };

    res.status(200).json({ message: "Course updated successfully", course: courseResponse });
    return;
  } catch (err) {
    console.error(err);
    const message =
      err instanceof Error ? err.message : "An unknown error occurred";
    res.status(500).json({ error: message });
    return;
  }
};
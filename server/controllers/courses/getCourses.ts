import { Request, Response } from "express";
import searchCourses from "../../utils/searchCourses.ts";
import { courseSchema } from "../../validators/course.validators.ts";
import Course from "../../models/Course.ts";

export const getCourses = async (
  req: Request,
  res: Response,
): Promise<Response | void> => {
  try {
    const pageSize = Number(req.query.page_size) || 10;
    const page = Number(req.query.page) || 1;
    const search = typeof req.query.search === "string" ? req.query.search : "";
    const sort = typeof req.query.sort === "string" ? req.query.sort : "";

    const { courses, totalCourses, totalPages, nextPage, previousPage } =
      await searchCourses(search, sort, page, pageSize);

    if (!courses || courses.length === 0) {
      res.status(404).json({ message: "No courses found" });
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
      logo?: string; 
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
        exercisesLength: course.exercisesLength,
        logo: course.logo || "", 
      });
    });

    res.status(200).json({
      message: "Courses retrieved successfully",
      courseList,
      totalItems: totalCourses,
      totalPages,
      currentPage: page,
      nextPage,
      previousPage,
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

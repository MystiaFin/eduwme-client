import {searchExercises} from "../../utils/searchExercises";
import { Request, Response } from "express";

export const getExercise = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const pageSize = Number(req.query.page_size) || 10;
    const page = Number(req.query.page) || 1;
    const search = typeof req.query.search === "string" ? req.query.search : "";
    const sort = typeof req.query.sort === "string" ? req.query.sort : "";

    const { exercises, totalExercises, totalPages, nextPage, previousPage } =
      await searchExercises(search, sort, page, pageSize);

    if (!exercises || exercises.length === 0) {
      res.status(404).json({ message: "No exercises found" });
      return;
    }

    res.status(200).json({
      message: "Exercises retrieved successfully",
      exercises,
      totalItems: totalExercises,
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

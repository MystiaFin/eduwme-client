import genericSearch from "./genericSearch.ts";
import Exercise from "../models/Exercise.ts";

export default async function searchExercises(
  search: string,
  sort: string,
  pageNumber: number,
  pageSize: number,
) {
  const validSearchKeys = [
    "exerciseId",
    "courseId",
    "courseBatchId",
    "title",
    "difficultyLevel",
    "type",
  ];
  const validSortKeys = [
    "exerciseId",
    "courseId",
    "title",
    "difficultyLevel",
    "dateCreated",
    "type",
  ];
  const numericFields = ["difficultyLevel"];

  const result = await genericSearch(
    Exercise,
    validSearchKeys,
    validSortKeys,
    numericFields,
    search,
    sort,
    pageNumber,
    pageSize,
  );

  return {
    exercises: result.items,
    totalExercises: result.totalItems,
    totalPages: result.totalPages,
    nextPage: result.nextPage,
    previousPage: result.previousPage,
  };
}

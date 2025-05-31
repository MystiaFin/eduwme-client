import genericSearch from "./genericSearch";
import Course from "../models/Course";

export default async function searchCourses(
  search: string,
  sort: string,
  pageNumber: number,
  pageSize: number,
) {
  const validSearchKeys = ["courseBatchId", "title", "level"];
  const validSortKeys = ["courseBatchId", "title", "level", "dateCreated"];
  const numericFields = ["level"];

  const result = await genericSearch(
    Course,
    validSearchKeys,
    validSortKeys,
    numericFields,
    search,
    sort,
    pageNumber,
    pageSize,
  );

  return {
    courses: result.items,
    totalCourses: result.totalItems,
    totalPages: result.totalPages,
    nextPage: result.nextPage,
    previousPage: result.previousPage,
  };
}

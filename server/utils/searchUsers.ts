import genericSearch from "./genericSearch.ts";
import User from "../models/User.ts";

export default async function searchUsers(
  search: string,
  sort: string,
  pageNumber: number,
  pageSize: number,
) {
  const validSearchKeys = ["username", "email", "nickname"];
  const validSortKeys = [
    "username",
    "email",
    "nickname",
    "dateCreated",
    "xp",
    "level",
  ];
  const numericFields = ["xp", "level"];

  const result = await genericSearch(
    User,
    validSearchKeys,
    validSortKeys,
    numericFields,
    search,
    sort,
    pageNumber,
    pageSize,
  );

  // Rename the items to maintain backward compatibility
  return {
    modifiedUsers: result.items,
    totalUsers: result.totalItems,
    totalPages: result.totalPages,
    nextPage: result.nextPage,
    previousPage: result.previousPage,
  };
}

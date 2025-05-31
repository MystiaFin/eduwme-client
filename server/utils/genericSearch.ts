import User from "../models/User.ts";
import { Model } from "mongoose";

export default async function genericSearch(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  model: any,
  validSearchKeys: string[],
  validSortKeys: string[],
  numericFields: string[],
  search: string,
  sort: string,
  pageNumber: number,
  pageSize: number,
) {
  // Create a MongoDB query filter
  let filter = {};

  if (search) {
    const [searchKey, searchValue] = search.split(":");

    // Validate search key
    if (!validSearchKeys.includes(searchKey)) {
      throw new Error(
        `Invalid search key. Allowed keys: ${validSearchKeys.join(", ")}`,
      );
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
      filter = { [searchKey]: { $regex: searchValue, $options: "i" } };
    }
  }

  // Get total count for pagination calculations
  const totalItems = await model.countDocuments(filter);

  // Prepare sort options
  let sortOptions = {};
  if (sort) {
    const [sortKey, sortOrder] = sort.toLowerCase().split(":");

    // Validate sort key
    if (!validSortKeys.includes(sortKey)) {
      throw new Error(
        `Invalid sort key. Allowed keys: ${validSortKeys.join(", ")}`,
      );
    }

    // Validate sort order
    if (sortOrder !== "asc" && sortOrder !== "desc") {
      // Default to ascending if invalid
      sortOptions = { [sortKey]: 1 };
    } else {
      sortOptions = { [sortKey]: sortOrder === "asc" ? 1 : -1 };
    }
  }

  // Calculate pagination values
  const totalPages = Math.ceil(totalItems / pageSize);
  const startIndex = (pageNumber - 1) * pageSize;

  // Get paginated results with filtering and sorting at database level
  const items = await model
    .find(filter)
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

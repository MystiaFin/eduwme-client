export default async function genericSearch(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  model: any,
  validSearchKeys: string[],
  validSortKeys: string[],
  numericFields: string[],
  search: string | null | undefined,
  sort: string | null | undefined,
  pageNumber: number,
  pageSize: number,
) {
  // Create a MongoDB query filter
  let filter = {};

  if (search && typeof search === 'string') {
    // Check if the search string contains a colon for key:value format
    if (search.includes(':')) {
      const parts = search.split(':');
      if (parts.length >= 2) {
        const searchKey = parts[0];
        const searchValue = parts.slice(1).join(':'); // Rejoin in case the value itself contains colons
        
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
      } else {
        // If just a single term with no colon or malformed, search across all valid fields
        const searchTerm = search;
        const orConditions = validSearchKeys
          .filter(key => !numericFields.includes(key)) // Only use text fields for general search
          .map(key => ({ [key]: { $regex: searchTerm, $options: "i" } }));
        
        if (orConditions.length > 0) {
          filter = { $or: orConditions };
        }
      }
    } else {
      // If just a single term with no colon, search across all valid text fields
      const searchTerm = search;
      const orConditions = validSearchKeys
        .filter(key => !numericFields.includes(key)) // Only use text fields for general search
        .map(key => ({ [key]: { $regex: searchTerm, $options: "i" } }));
      
      if (orConditions.length > 0) {
        filter = { $or: orConditions };
      }
    }
  }

  // Get total count for pagination calculations
  const totalItems = await model.countDocuments(filter);

  // Prepare sort options
  let sortOptions = {};
  if (sort && typeof sort === 'string') {
    const parts = sort.toLowerCase().split(':');
    if (parts.length >= 2) {
      const sortKey = parts[0];
      const sortOrder = parts[1];

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
  }

  // Calculate pagination values
  const totalPages = Math.ceil(totalItems / pageSize) || 1; // Ensure at least 1 page
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
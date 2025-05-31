import { Request, Response } from "express";
import searchUsers from "../../utils/searchUsers.ts";

export const getUsers = async (
  req: Request,
  res: Response,
): Promise<Response | void> => {
  try {
    const pageSize = Number(req.query.page_size) || 10;
    const page = Number(req.query.page) || 1;
    const search = typeof req.query.search === "string" ? req.query.search : "";
    const sort = typeof req.query.sort === "string" ? req.query.sort : "";

    const {
      modifiedUsers: users,
      totalUsers: totalItems,
      totalPages,
      nextPage,
      previousPage,
    } = await searchUsers(search, sort, page, pageSize);

    if (users.length === 0) {
      return res.status(404).json({ message: "No users found" });
    }

    return res.status(200).json({
      message: "Users retrieved successfully",
      users,
      totalItems,
      totalPages,
      nextPage,
      previousPage,
    });
  } catch (err) {
    console.error(err);
    const message =
      err instanceof Error ? err.message : "An unknown error occurred";
    return res.status(500).json({ error: message });
  }
};

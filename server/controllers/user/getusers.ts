import { Request, Response } from "express";
import searchUsers from "../../utils/searchUsers";

export const getUsers = async (
  req: Request,
  res: Response,
): Promise<void> => {
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

    if (!users || users.length === 0) {
      res.status(404).json({ message: "No users found" });
      return;
    }

    // compress user profile picture strings
    const compressedUsers = users.map((user: any) => ({
      userId: user._id,
      username: user.username,
      nickname: user.nickname,
      email: user.email,
      biodata: user.biodata,
      xp: user.xp,
      userGems: user.gems,
      level: user.level,
      userRole: user.role,
      inventory: user.inventory,
      userProgress: user.courseBatchesProgress,
    }));

    res.status(200).json({
      message: "Users retrieved successfully",
      users: compressedUsers,
      totalItems,
      totalPages,
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

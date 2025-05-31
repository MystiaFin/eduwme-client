import { NextFunction } from "express";
import { Request, Response } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET: string | undefined = process.env.JWT_SECRET;

declare module "express" {
  interface Request {
    user?: {
      id: string;
      username: string;
      role: string;
    };
  }
}

// Base middleware to verify token and attach user to request
export const verifyTokenMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const token = req.headers['authorization']?.split(' ')[1];

    if (!token) {
      res.status(401).json({ message: 'Token is required' });
      return;
    }

    jwt.verify(token, JWT_SECRET || 'default_secret', (err, decoded) => {
      if (err) {
        res.status(401).json({ message: 'Invalid token' });
        return;
      }
      
      // Attach decoded user to request
      req.user = decoded as { id: string; username: string; role: string };
      next();
    });
  } catch (err) {
    console.error("Error in verifyToken middleware:", err);
    res.status(500).json({ message: 'Internal server error during token verification' });
  }
};

// Middleware for user-level access (both users and admins)
export const isUser = (req: Request, res: Response, next: NextFunction): void => {
  verifyTokenMiddleware(req, res, () => {
    if (req.user) {
      next();
    } else {
      res.status(403).json({ message: 'Access denied: User authorization required' });
    }
  });
};

// Middleware for admin-only access
export const isAdmin = (req: Request, res: Response, next: NextFunction): void => {
  verifyTokenMiddleware(req, res, () => {
    if (req.user && req.user.role === 'admin') {
      next();
    } else {
      res.status(403).json({ message: 'Access denied: Admin authorization required' });
    }
  });
};

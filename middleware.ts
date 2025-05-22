import { NextFunction } from "express";
import { Request, Response } from "express";
import jwt from "jsonwebtoken";
const JWT_SECRET: string | undefined = process.env.JWT_SECRET;


const verifyTokenMiddleware = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const token = req.headers['authorization']?.split(' ')[1];

      if (!token) {
        res.status(401).json({ message: 'Token is required' });
        return;
      }

      jwt.verify(token, JWT_SECRET || 'default_secret', (err) => {
        if (err) {
          res.status(401).json({ message: 'Invalid token' });
          return;
        }
        next(); 
      });
    } catch (err) {
        // This catch block might not be strictly necessary here if jwt.verify handles its own errors
        // and doesn't throw in a way that bypasses its callback.
        // However, it's good for catching unexpected issues.
        console.error("Error in verifyTokenMiddleware:", err);
        res.status(500).json({ message: 'Internal server error during token verification' });
    }
  }

  export default verifyTokenMiddleware;
import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    // Get token from cookie
    const token = req.cookies.accessToken;

    if (!token) {
      return res.status(401).json({
        message: 'Authentication required',
      });
    }

    // Get JWT secret
    const jwtSecret = process.env.JWT_SECRET;

    if (!jwtSecret) {
      throw new Error('JWT_SECRET is not configured');
    }

    // Verify token
    const decoded = jwt.verify(token, jwtSecret);

    // Get user ID from JWT
    if (typeof decoded !== 'object' || !('userId' in decoded)) {
      return res.status(401).json({
        message: 'Invalid token',
      });
    }

    // Attach user ID to request
    req.userId = decoded.userId as number;

    // Continue to controller
    next();
  } catch (error) {
    console.error('Authentication error:', error);

    return res.status(401).json({
      message: 'Invalid or expired token',
    });
  }
};
import type { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

import { db } from '../prisma/db';
import { registerSchema , loginSchema} from '../validations/auth.validation';



export const register = async (req: Request, res: Response) => {
  try {
    const result = registerSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: result.error.flatten(),
      });
    }

    const { email, password } = result.data;

    const existingUser = await db.orm.public.User.first({
      email,
    });

    if (existingUser) {
      return res.status(409).json({
        message: 'User already exists',
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await db.orm.public.User.create({
      email,
      passwordHash: hashedPassword,
    });

    const jwtSecret = process.env.JWT_SECRET;

    if (!jwtSecret) {
      throw new Error('JWT_SECRET is not configured');
    }

    const token = jwt.sign(
      { userId: newUser.id },
      jwtSecret,
      { expiresIn: '1h' },
    );

    res.cookie('accessToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 1000,
    });

    return res.status(201).json({
      message: 'User registered successfully',
      newUser: {
        id: newUser.id,
        email: newUser.email,
      },
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: 'Error occurred while registering',
    });
  }
};

export const login = async (req: Request, res: Response) => {
  try{
    const loginResult = loginSchema.safeParse(req.body);
    if (!loginResult.success) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: loginResult.error.flatten(),
      });
    }
    const { email, password } = loginResult.data;

    const user = await db.orm.public.User.first({
      email,
    });

   if (!user) {
  return res.status(401).json({
    message: 'Invalid email or password',
  });
}

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
     
   if (!isPasswordValid) {
  return res.status(401).json({
    message: 'Invalid email or password',
  });
}

    const jwtSecret = process.env.JWT_SECRET;

if (!jwtSecret) {
  throw new Error('JWT_SECRET is not configured');
}
    const token = jwt.sign({userId: user.id},jwtSecret, {expiresIn: '1h'},);

     res.cookie('accessToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 1000,
    });

    return res.status(200).json({
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
      },
    });

  }catch(error){
    console.error(error);
    return res.status(500).json({
      message: 'Error occurred while logging in',
    });
  }
};

export const getMe = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({
        message: 'Authentication required',
      });
    }

    const user = await db.orm.public.User.first({
      id: userId,
    });

    if (!user) {
      return res.status(404).json({
        message: 'User not found',
      });
    }

    return res.status(200).json({
      user: {
        id: user.id,
        email: user.email,
      },
    });
  } catch (error) {
    console.error('Get user error:', error);

    return res.status(500).json({
      message: 'Error occurred while fetching user',
    });
  }
};

export const logout = (req: Request, res: Response) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({
        message: 'Authentication required',
      });
    }

    res.clearCookie('accessToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    });

    return res.status(200).json({
      message: 'Logout successful',
    });
  } catch (error) {
    console.error('Logout error:', error);

    return res.status(500).json({
      message: 'Error occurred while logging out',
    });
  }
};
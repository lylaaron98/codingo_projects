import type { VercelRequest, VercelResponse } from '@vercel/node';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { connectToDatabase } from '../../backend/lib/db';
import User from '../../backend/models/User';
import { loginSchema } from '../../backend/validators/auth';
import {
  sendSuccess,
  sendValidationError,
  sendUnauthorized,
  sendServerError,
  handleCors,
} from '../../backend/lib/responses';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (handleCors(req, res)) return;
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await connectToDatabase();

    // Validate request body
    const validation = loginSchema.safeParse(req.body);
    if (!validation.success) {
      return sendValidationError(res, validation.error);
    }

    const { username, password } = validation.data;

    // Find user
    const user = await User.findOne({ username });
    if (!user) {
      return sendUnauthorized(res, 'Invalid credentials');
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return sendUnauthorized(res, 'Invalid credentials');
    }

    // Generate JWT
    const JWT_SECRET = process.env.JWT_SECRET;
    if (!JWT_SECRET) {
      throw new Error('JWT_SECRET is not configured');
    }

    const token = jwt.sign(
      {
        userId: user._id.toString(),
        username: user.username,
        role: user.role,
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    return sendSuccess(res, {
      token,
      user: {
        id: user._id,
        username: user.username,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return sendServerError(res);
  }
}

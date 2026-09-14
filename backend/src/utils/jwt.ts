import jwt, { SignOptions } from 'jsonwebtoken';
import { Response } from 'express';
import { ENV } from '../config/env.js';

export interface JwtPayload {
  userId: string;
}

/**
 * Signs a secure JWT for the specified user ID.
 */
export function generateToken(userId: string): string {
  const options: SignOptions = {
    expiresIn: (ENV.JWT_EXPIRES_IN || '7d') as any,
  };
  return jwt.sign({ userId }, ENV.JWT_SECRET, options);
}

/**
 * Verifies a JWT and returns the parsed payload.
 * Throws an error if invalid or expired.
 */
export function verifyJwt(token: string): JwtPayload {
  return jwt.verify(token, ENV.JWT_SECRET) as JwtPayload;
}

/**
 * Sets an HTTP-only authentication cookie on the response.
 */
export function setAuthCookie(res: Response, token: string): void {
  const isProd = ENV.NODE_ENV === 'production';
  res.cookie('token', token, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: '/',
  });
}

/**
 * Clears the authentication cookie.
 */
export function clearAuthCookie(res: Response): void {
  const isProd = ENV.NODE_ENV === 'production';
  res.cookie('token', '', {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax',
    expires: new Date(0),
    path: '/',
  });
}

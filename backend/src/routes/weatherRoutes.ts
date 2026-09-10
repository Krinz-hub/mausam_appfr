import { Router, Request, Response } from 'express';

export const weatherRouter = Router();

/**
 * Foundation endpoints prepared for Engine 2 / IMD integration
 */
weatherRouter.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    engine: 'Engine 2 Weather Intelligence Gateway',
    timestamp: new Date().toISOString(),
  });
});

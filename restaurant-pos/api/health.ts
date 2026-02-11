import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getConnectionStatus } from '../backend/lib/db';
import { handleCors } from '../backend/lib/responses';

/**
 * Health check endpoint
 * GET /api/health
 */
export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (handleCors(req, res)) return;
  
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const dbStatus = getConnectionStatus();

    return res.status(200).json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      database: dbStatus,
    });
  } catch (error) {
    console.error('Health check error:', error);
    return res.status(500).json({
      status: 'error',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

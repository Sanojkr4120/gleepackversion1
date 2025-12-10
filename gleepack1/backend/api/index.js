// Load environment variables first - MUST be before any other imports
import 'dotenv/config';

import connectDB from '../config/db.js';

// Cache the app instance
let appPromise = null;

const getApp = async () => {
  if (!appPromise) {
    appPromise = (async () => {
      await connectDB();
      const serverModule = await import('../server.js');
      return serverModule.default;
    })();
  }
  return appPromise;
};

export default async (req, res) => {
  try {
    // Handle Vercel health check / warmup
    if (req.url === '/_warmup' || req.url === '/api/_warmup') {
      return res.status(200).json({ status: 'ok', timestamp: Date.now() });
    }

    const app = await getApp();
    return app(req, res);
  } catch (error) {
    console.error("Vercel Function Error:", error.message, error.stack);
    res.status(500).json({ 
      message: "Server Internal Error", 
      error: process.env.NODE_ENV === 'production' ? 'Internal Server Error' : error.message
    });
  }
};

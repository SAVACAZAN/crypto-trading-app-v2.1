/**
 * Health Check Endpoint
 * Simple ping endpoint to verify server is running
 */

export default defineEventHandler(async (event) => {
  return {
    status: 'OK',
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: {
      used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + ' MB',
      total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + ' MB'
    },
    nodeVersion: process.version,
    platform: process.platform
  };
});

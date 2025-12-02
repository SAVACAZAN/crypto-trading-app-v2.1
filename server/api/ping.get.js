/**
 * Simple Ping Endpoint
 * Fastest response to check if server is alive
 */

export default defineEventHandler(() => {
  return { pong: true, time: Date.now() };
});

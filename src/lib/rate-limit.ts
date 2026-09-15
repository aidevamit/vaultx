// Basic in-memory rate limiter to prevent brute force attacks on the login route
const rateLimitMap = new Map<string, { count: number; lastReset: number }>();

const WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const MAX_REQUESTS = 5; // 5 failed attempts per window

export function checkRateLimit(ip: string): { success: boolean; message?: string } {
  const now = Date.now();
  const userRecord = rateLimitMap.get(ip);

  if (!userRecord) {
    rateLimitMap.set(ip, { count: 1, lastReset: now });
    return { success: true };
  }

  if (now - userRecord.lastReset > WINDOW_MS) {
    // Reset window
    rateLimitMap.set(ip, { count: 1, lastReset: now });
    return { success: true };
  }

  if (userRecord.count >= MAX_REQUESTS) {
    return { success: false, message: 'Too many login attempts. Please try again later in 15 minutes.' };
  }

  userRecord.count += 1;
  return { success: true };
}

export function resetRateLimit(ip: string) {
  rateLimitMap.delete(ip);
}

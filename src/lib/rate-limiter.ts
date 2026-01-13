// Simple in-memory rate limiter for production use
// For high-scale production, consider using Redis instead

interface RateLimitEntry {
    count: number;
    firstRequest: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

// Configuration
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const MAX_REQUESTS_PER_WINDOW = 3; // Max 3 requests per window

// Cleanup old entries periodically
setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of rateLimitStore.entries()) {
        if (now - entry.firstRequest > RATE_LIMIT_WINDOW_MS) {
            rateLimitStore.delete(key);
        }
    }
}, 60 * 1000); // Cleanup every minute

export function checkRateLimit(identifier: string): { allowed: boolean; remainingTime?: number } {
    const now = Date.now();
    const entry = rateLimitStore.get(identifier);

    if (!entry) {
        // First request from this identifier
        rateLimitStore.set(identifier, { count: 1, firstRequest: now });
        return { allowed: true };
    }

    // Check if the window has expired
    if (now - entry.firstRequest > RATE_LIMIT_WINDOW_MS) {
        // Reset the window
        rateLimitStore.set(identifier, { count: 1, firstRequest: now });
        return { allowed: true };
    }

    // Check if they've exceeded the limit
    if (entry.count >= MAX_REQUESTS_PER_WINDOW) {
        const remainingTime = Math.ceil((RATE_LIMIT_WINDOW_MS - (now - entry.firstRequest)) / 1000);
        return { allowed: false, remainingTime };
    }

    // Increment the count
    entry.count++;
    return { allowed: true };
}

export function getRateLimitKey(type: "ip" | "email", value: string): string {
    return `${type}:${value.toLowerCase()}`;
}

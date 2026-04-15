import { NextResponse } from "next/server";
import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";


const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || "",
  token: process.env.UPSTASH_REDIS_REST_TOKEN || "",
});

// Rate limit: 5 requests per minute per IP
const ratelimit = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(5, "1 m"), 
  analytics: true,
});

export async function POST(request: Request) {
  try {
    // fetch client IP address from request headers (x-forwarded-for) or fallback to localhost
    const ip = request.headers.get("x-forwarded-for") ?? "127.0.0.1";

    //check the rate limit for this IP
    const { success, limit, remaining } = await ratelimit.limit(ip);

    if (!success) {
      return NextResponse.json(
        { error: "Rate limit exceeded! Bot protection active." },
        { status: 429 }
      );
    }

    return NextResponse.json({ success: true, remaining });
  } catch (error) {
    console.error("Rate limit error:", error);
    // if redis goes down or any error,we don't want to block legitimate users, so we allow the request to go through
    return NextResponse.json({ success: true }); 
  }
}
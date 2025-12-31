/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import Redis from "ioredis";
import { auth } from "@/auth";

const redis = new Redis(process.env.REDIS_URL || "redis://redis:6379");

export async function POST(req: Request) {
  try {
    const session = await auth();
    const body = await req.json();
    const { url, quality } = body;

    if (!url) {
      return NextResponse.json({ error: "No URL provided" }, { status: 400 });
    }

    // 1. Determine User Status
    // If no session, they are "guest" (isPro = false)
    const isPro = !!session?.user?.isPro;
    
    // 2. Set Limits based on Status
    // Pro = 50 frames. Everyone else (Free/Guest) = 12 frames.
    const limit = isPro ? 50 : 12; 

    // 3. Enforce Quality Rules
    let requestedQuality = parseInt(quality) || 480;
    if (!isPro && requestedQuality > 480) {
      requestedQuality = 480; // Downgrade free/guest users
    }

    const jobId = Date.now().toString();
    
    const jobData = JSON.stringify({ 
      jobId, 
      url,
      userId: session?.user?.id || "guest",
      isPro,
      quality: requestedQuality,
      limit: limit // 👈 SENDING THE LIMIT TO PYTHON
    });

    await redis.set(`job:${jobId}`, JSON.stringify({ status: "QUEUED", jobId }));
    await redis.lpush("video_queue", jobData);

    return NextResponse.json({ 
      success: true, 
      jobId, 
      quality: requestedQuality,
      limit: limit 
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
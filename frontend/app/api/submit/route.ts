/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import Redis from "ioredis";

const redis = new Redis(process.env.REDIS_URL || "redis://redis:6379");

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { url, quality } = body;

    if (!url) {
      return NextResponse.json({ error: "No URL provided" }, { status: 400 });
    }

    // Open access: allow higher quality and larger extraction for everyone
    const isPro = true;
    const limit = 100;
    const requestedQuality = parseInt(quality) || 480;

    const jobId = Date.now().toString();
    
    const jobData = JSON.stringify({ 
      jobId, 
      url,
      userId: "public",
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
/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import Redis from "ioredis";
import { auth } from "@/auth"; // <--- Import Auth

export const dynamic = 'force-dynamic';

const redis = new Redis(process.env.REDIS_URL || "redis://redis:6379");

export async function GET(req: Request) {
  try {
    const session = await auth(); // <--- Check who is asking
    
    const { searchParams } = new URL(req.url);
    const jobId = searchParams.get("jobId");

    if (!jobId) {
      return NextResponse.json({ error: "Missing Job ID" }, { status: 400 });
    }

    const rawData = await redis.get(`job:${jobId}`);
    
    if (!rawData) {
      return NextResponse.json({ status: "PROCESSING" });
    }

    const jobData = JSON.parse(rawData);

    if (jobData.status !== "DONE") {
      return NextResponse.json(jobData);
    }

    // ============================================================
    // 🟢 REAL GATEKEEPER LOGIC
    // ============================================================
    
    // Check the session!
    const isPro = !!session?.user?.isPro; 
    const FREE_LIMIT = 12;

    let safeFrames = jobData.frames;
    let safeZip = jobData.zipUrl;

    if (!isPro) {
      // 1. Hide Zip
      safeZip = null;

      // 2. Lock extra frames but provide a preview image URL so UI can blur it
      safeFrames = jobData.frames.map((frame: any, index: number) => {
        if (index < FREE_LIMIT) {
          return frame;
        } else {
          return {
            ...frame,
            // Keep a preview image available for blurred display on the frontend
            imageUrl: frame.imageUrl,
            isLocked: true,
          };
        }
      });
    }

    return NextResponse.json({
      status: "DONE",
      zipUrl: safeZip,
      frames: safeFrames,
      isPro: isPro 
    });

  } catch (error) {
    console.error("Status Check Error:", error);
    return NextResponse.json({ status: "ERROR", error: "Internal Server Error" }, { status: 500 });
  }
}
/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import Redis from "ioredis";

export const dynamic = 'force-dynamic';

const redis = new Redis(process.env.REDIS_URL || "redis://redis:6379");

export async function GET(req: Request) {
  try {
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

    // Return the full job data for everyone (no gating)
    return NextResponse.json(jobData);

  } catch (error) {
    console.error("Status Check Error:", error);
    return NextResponse.json({ status: "ERROR", error: "Internal Server Error" }, { status: 500 });
  }
}
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const fileUrl = searchParams.get("url");
  const filename = searchParams.get("filename") || "image.jpg";

  if (!fileUrl) {
    return NextResponse.json({ error: "Missing URL" }, { status: 400 });
  }

  try {
    // 1. Fetch the image from Google Cloud on the server side
    const response = await fetch(fileUrl);
    
    if (!response.ok) throw new Error("Failed to fetch image");

    // 2. Get the image data
    const imageBuffer = await response.arrayBuffer();

    // 3. Send it back to the browser with headers that FORCE download
    return new NextResponse(imageBuffer, {
      headers: {
        "Content-Type": response.headers.get("Content-Type") || "image/jpeg",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });

  } catch (error) {
    console.error("Download Proxy Error:", error);
    return NextResponse.json({ error: "Download failed" }, { status: 500 });
  }
}
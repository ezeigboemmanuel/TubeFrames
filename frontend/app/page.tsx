"use client";

import { useState, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
// Auth removed — open app for everyone
import { URLInput } from "@/components/URLInput";
import { FrameGrid } from "@/components/FrameGrid";
import { HowItWorks } from "@/components/HowItWorks";
import { UseCases } from "@/components/UseCases";
import { PricingTeaser } from "@/components/PricingTeaser";
import { Footer } from "@/components/Footer";
import Link from "next/link";

export default function Home() {
  // App is open to everyone — enable all features by default
  const isPro = true;

  const [isLoading, setIsLoading] = useState(false);
  const [frames, setFrames] = useState<
    { id: number; timestamp: string; imageUrl: string }[]
  >([]);
  const [hasExtracted, setHasExtracted] = useState(false);
  const [zipUrl, setZipUrl] = useState("");
  const { toast } = useToast();

  const pollInterval = useRef<NodeJS.Timeout | null>(null);

  const startPolling = (jobId: string) => {
    if (pollInterval.current) clearInterval(pollInterval.current);

    pollInterval.current = setInterval(async () => {
      try {
        const res = await fetch(`/api/status?jobId=${jobId}`);
        const data = await res.json();

        if (data.status === "DONE") {
          if (pollInterval.current) clearInterval(pollInterval.current);
          setFrames(data.frames);
          setZipUrl(data.zipUrl);
          setHasExtracted(true);
          setIsLoading(false);

          toast({
            title: "Extraction Complete",
            description: `Successfully captured ${data.frames.length} unique frames.`,
          });
        } else if (data.status === "ERROR") {
          if (pollInterval.current) clearInterval(pollInterval.current);
          setIsLoading(false);
          toast({
            variant: "destructive",
            title: "Extraction Failed",
            description:
              data.error || "Could not process this YouTube video.",
          });
        }
      } catch (err) {
        console.error("Polling error", err);
      }
    }, 2000);
  };

  const handleExtract = async (url: string, quality: string) => {
    setIsLoading(true);
    setHasExtracted(false);
    setFrames([]);

    try {
      const res = await fetch("/api/submit", {
        method: "POST",
        body: JSON.stringify({ url, quality }),
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) throw new Error("Failed to submit job");

      const data = await res.json();
      if (data.jobId) {
        toast({
          title: "Processing Video...",
          description: "Running scene detection algorithm (15-30s).",
        });
        startPolling(data.jobId);
      }
    } catch (error) {
      setIsLoading(false);
      toast({
        variant: "destructive",
        title: "Connection Error",
        description: "Could not connect to the server.",
      });
    }
  };

  const handleDownloadFrame = (frame: {
    id: number;
    timestamp: string;
    imageUrl: string;
  }) => {
    toast({
      title: "Downloading Frame",
      description: `Saving frame at ${frame.timestamp}...`,
    });

    const filename = `frame_${frame.timestamp.replace(/:/g, "-")}.jpg`;
    const proxyUrl = `/api/download?url=${encodeURIComponent(
      frame.imageUrl
    )}&filename=${filename}`;

    const link = document.createElement("a");
    link.href = proxyUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadZip = () => {
    if (zipUrl) {
      window.open(zipUrl, "_blank");
      toast({
        title: "Downloading ZIP",
        description: "Your download has started.",
      });
    }
  };

  const handleUpgrade = () => {
    // No upgrade required — feature removed.
  };

  return (
    <div className="min-h-screen bg-background px-4">
      <header className="py-6 border-b border-border flex items-center justify-center">
        <div className="container">
          <div className="flex items-center justify-between">
            <span className="font-mono font-bold text-lg text-foreground">
              TubeFrames
            </span>
            {/* <nav className="hidden sm:flex items-center gap-6">
              <Link
                href="/"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors font-mono"
              >
                Support?
              </Link>
              <AuthButton />
            </nav> */}
          </div>
        </div>
      </header>

      <section className="py-20 md:py-32 flex items-center justify-center">
        <div className="container">
          <div className="text-center mb-12 flex flex-col justify-center items-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-mono font-bold tracking-tight text-foreground mb-6 text-balance max-w-4xl">
              Extract Frames from YouTube with Smart Scene Detection
            </h1>
            <p className="text-xl text-muted-foreground max-w-xl mx-auto">
              Don&apos;t settle for random screenshots. Our algorithm analyzes the video 
              to detect every scene change, giving you the perfect frames automatically.
            </p>
          </div>

          <URLInput onExtract={handleExtract} isLoading={isLoading} />
        </div>
      </section>

      {hasExtracted && (
        <section className="pb-20 flex items-center justify-center">
          <div className="container">
            <FrameGrid
              frames={frames}
              freeLimit={12}
              onDownloadFrame={handleDownloadFrame}
              onDownloadZip={handleDownloadZip}
            />
          </div>
        </section>
      )}

      {!hasExtracted && <HowItWorks />}
      {!hasExtracted && <UseCases />}
      {!hasExtracted && <PricingTeaser />}
      <Footer />
    </div>
  );
}
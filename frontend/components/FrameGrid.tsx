import { Button } from "@/components/ui/button";
import { Lock, FileArchive } from "lucide-react";
import { FrameCard } from "./FrameCard";

interface Frame {
  id: number;
  timestamp: string;
  imageUrl: string;
}

interface FrameGridProps {
  frames: Frame[];
  freeLimit?: number;
  onDownloadFrame?: (frame: Frame) => void;
  onDownloadZip?: () => void;
}

export const FrameGrid = ({
  frames,
  freeLimit = 12,
  onDownloadFrame,
  onDownloadZip,
}: FrameGridProps) => {
  // No gating — show all frames
  const freeFrames = frames;

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-mono font-medium text-foreground">
            {frames.length} frames detected
          </h2>
          <p className="text-muted-foreground text-sm font-mono mt-1">
            Access all detected frames and downloads.
          </p>
        </div>
        <div className="flex gap-3">
          {/* ZIP Button: Changes appearance based on Pro status */}
          <Button size="lg" className="font-mono" onClick={onDownloadZip}>
            <FileArchive className="mr-2 h-4 w-4" />
            Download ZIP
          </Button>
        </div>
      </div>

      {/* Visible/Free Frames */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
        {freeFrames.map((frame, index) => (
          <FrameCard
            key={frame.id}
            timestamp={frame.timestamp}
            frameNumber={frame.id}
            imageUrl={frame.imageUrl}
            onDownload={() => onDownloadFrame?.(frame)}
            animationDelay={index * 50}
          />
        ))}
      </div>

      {/* All frames shown — no locked section. */}
    </div>
  );
};
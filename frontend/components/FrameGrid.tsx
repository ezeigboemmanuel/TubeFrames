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
  isPro: boolean; // <--- Added this prop
  freeLimit?: number;
  previewLimit?: number;
  onDownloadFrame?: (frame: Frame) => void;
  onUpgrade?: () => void;
  onDownloadZip?: () => void;
}

export const FrameGrid = ({
  frames,
  isPro,
  freeLimit = 12,
  previewLimit = 12,
  onDownloadFrame,
  onUpgrade,
  onDownloadZip,
}: FrameGridProps) => {
  // LOGIC: If Pro, the "free limit" is basically infinite (all frames)
  const effectiveLimit = isPro ? frames.length : freeLimit;

  const freeFrames = frames.slice(0, effectiveLimit);
  const lockedFrames = frames.slice(effectiveLimit);
  const hasLockedFrames = lockedFrames.length > 0;
  
  // How many locked frames to show as "blurred/preview"
  const previewCount = Math.max(0, Math.min(previewLimit, lockedFrames.length));

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-mono font-medium text-foreground">
            {frames.length} frames detected
          </h2>
          <p className="text-muted-foreground text-sm font-mono mt-1">
            {isPro 
              ? "✅ Pro Unlocked: Access to all frames" 
              : `${freeFrames.length} free • ${lockedFrames.length} locked`
            }
          </p>
        </div>
        <div className="flex gap-3">
          {/* ZIP Button: Changes appearance based on Pro status */}
          <Button
            variant={isPro ? "default" : "outline"} // Highlight for Pro
            size="lg"
            className="font-mono"
            onClick={onDownloadZip}
            disabled={!isPro && frames.length > 0} // Optional: Disable click if not Pro
          >
            {isPro ? (
              <>
                <FileArchive className="mr-2 h-4 w-4" />
                Download ZIP
              </>
            ) : (
              <>
                <Lock className="mr-2 h-4 w-4" />
                Download ZIP (Pro)
              </>
            )}
          </Button>

          {/* Unlock Button: Only show if not Pro and frames are hidden */}
          {!isPro && hasLockedFrames && (
            <Button variant="default" size="lg" onClick={onUpgrade}>
              <Lock className="mr-2 h-4 w-4" />
              Unlock all frames
            </Button>
          )}
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

      {/* Locked Frames Section (Only visible if not Pro) */}
      {!isPro && hasLockedFrames && (
        <>
          <div className="flex items-center gap-4 mb-6">
            <div className="h-px flex-1 bg-border" />
            <span className="text-muted-foreground text-sm font-mono flex items-center gap-2">
              <Lock className="w-4 h-4" />
              {lockedFrames.length} more frames available
            </span>
            <div className="h-px flex-1 bg-border" />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 opacity-75">
            {lockedFrames.slice(0, previewCount).map((frame, index) => (
              <FrameCard
                key={frame.id}
                timestamp={frame.timestamp}
                frameNumber={frame.id}
                imageUrl={frame.imageUrl}
                isLocked
                animationDelay={index * 50}
              />
            ))}
          </div>
          
          <div className="mt-6 text-center">
            <p className="text-muted-foreground text-sm font-mono mb-4">
              + {lockedFrames.length - previewCount} more frames hidden
            </p>
            <Button variant="default" size="lg" onClick={onUpgrade}>
              Unlock full extraction
            </Button>
          </div>
        </>
      )}
    </div>
  );
};
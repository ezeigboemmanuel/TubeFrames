/* eslint-disable @next/next/no-img-element */
import { Download, Lock } from "lucide-react";
import { cn } from "@/lib/utils";

interface FrameCardProps {
  timestamp: string;
  frameNumber: number;
  isLocked?: boolean;
  imageUrl?: string;
  onDownload?: () => void;
  animationDelay?: number;
}

export const FrameCard = ({
  timestamp,
  frameNumber,
  isLocked = false,
  imageUrl,
  onDownload,
  animationDelay = 0,
}: FrameCardProps) => {
  return (
    <div
      className={cn(
        "relative group rounded-lg overflow-hidden border transition-all duration-200 animate-frame-load",
        isLocked
          ? "border-border bg-frame-locked cursor-not-allowed"
          : "border-frame-border bg-frame hover:border-primary/50 cursor-pointer"
      )}
      style={{ animationDelay: `${animationDelay}ms` }}
      onClick={() => !isLocked && onDownload?.()}
    >
      <div className="aspect-video relative">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={`Frame ${frameNumber}`}
            className={cn(
              "w-full h-full object-cover",
              isLocked && "opacity-30 blur-sm"
            )}
          />
        ) : (
          <div
            className={cn(
              "w-full h-full",
              isLocked ? "bg-frame-locked" : "bg-frame"
            )}
          />
        )}

        {/* Timestamp overlay */}
        <div className="absolute bottom-2 left-2 px-2 py-1 bg-timestamp rounded text-xs font-mono text-foreground">
          {timestamp}
        </div>

        {/* Frame number */}
        <div className="absolute top-2 right-2 px-2 py-1 bg-background rounded text-xs font-mono text-muted-foreground">
          #{frameNumber.toString().padStart(3, "0")}
        </div>

        {/* Locked overlay */}
        {isLocked && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/60">
            <div className="flex flex-col items-center gap-2">
              <Lock className="w-6 h-6 text-muted-foreground" />
              <span className="text-xs font-mono text-muted-foreground">
                Upgrade to unlock
              </span>
            </div>
          </div>
        )}

        {/* Download hover overlay */}
        {!isLocked && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <div className="flex items-center gap-2 text-primary">
              <Download className="w-5 h-5" />
              <span className="text-sm font-mono font-medium">Download</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

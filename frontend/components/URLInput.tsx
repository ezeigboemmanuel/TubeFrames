"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Wand2 } from "lucide-react"; // Added Wand2 icon for "magic" scene detection vibe
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface URLInputProps {
  onExtract: (url: string, quality: string) => void;
  isLoading?: boolean;
}

export const URLInput = ({ onExtract, isLoading }: URLInputProps) => {
  const [url, setUrl] = useState("");
  const [quality, setQuality] = useState("480");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url.trim()) {
      onExtract(url.trim(), quality);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-3xl mx-auto">
      <div className="flex flex-col sm:flex-row gap-3">
        {/* 1. URL INPUT */}
        <div className="flex-1 relative">
          <Input
            type="url"
            placeholder="https://youtu.be/QLYoakDN9-I?si=-G4xVPlJR4TCtnhh" 
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="pr-36 h-14 text-base rounded-xl"
            disabled={isLoading}
          />

          {/* Quality Selector */}
          <div className="absolute right-2 top-1/2 -translate-y-1/2">
            <Select value={quality} onValueChange={setQuality} disabled={isLoading}>
              <SelectTrigger className="h-10 min-w-24 rounded-lg px-2 bg-background border-none shadow-none focus:ring-0">
                <SelectValue placeholder="Quality" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="360">360p (Fastest)</SelectItem>
                <SelectItem value="480">480p (Standard)</SelectItem>

                <SelectItem value="720">720p (HD)</SelectItem>
                <SelectItem value="1080">1080p (Full HD)</SelectItem>
                <SelectItem value="2160">4K (Ultra HD)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* 2. SUBMIT BUTTON */}
        <Button
          type="submit"
          size="lg"
          disabled={!url.trim() || isLoading}
          className="h-14 px-8 text-lg rounded-xl min-w-45"
        >
          {isLoading ? (
            <div className="flex items-center justify-center">
              <Loader2 className="animate-spin mr-2 h-5 w-5" />
              Detecting Scenes...
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Wand2 className="w-5 h-5" />
              Extract Frames
            </div>
          )}
        </Button>
      </div>
    </form>
  );
};
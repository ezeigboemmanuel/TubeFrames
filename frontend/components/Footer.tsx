import { Code, Bug } from "lucide-react";
import Link from "next/link";

export const Footer = () => {
  return (
    <footer className="py-12 border-t border-border flex items-center justify-center">
      <div className="container">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          
          {/* Brand & Disclaimer */}
          <div className="flex flex-col items-center md:items-start gap-1">
            <span className="font-mono font-bold text-lg text-foreground flex items-center gap-2">
              TubeFrames
            </span>
            <p className="text-xs text-muted-foreground">
              Not affiliated with YouTube
            </p>
          </div>

          {/* Navigation - Simplified for FOSS */}
          <nav className="flex flex-wrap items-center justify-center gap-6">
            <Link
              href="https://github.com/your-username/repo"
              target="_blank"
              className="flex items-center gap-2 text-sm text-foreground hover:text-primary transition-colors font-mono font-medium"
            >
              <Code className="w-4 h-4" />
              Source Code
            </Link>
            
            <Link
              href="https://github.com/your-username/repo/issues"
              target="_blank"
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-red-400 transition-colors"
            >
              <Bug className="w-4 h-4" />
              Report a Bug
            </Link>
          </nav>

          {/* Credits */}
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <span>Built by</span>
            <a 
              href="https://x.com/zgbocode" 
              target="_blank"
              className="font-medium text-foreground hover:underline decoration-primary underline-offset-4"
            >
              Emmanuel Ezeigbo
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
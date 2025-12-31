import {
  Image,
  Sparkles,
  Database,
  MonitorPlay,
  Share2,
} from "lucide-react";

const useCases = [
  { icon: MonitorPlay, label: "YouTube Thumbnails" },
  { icon: Sparkles, label: "AI Image Generation" },
  { icon: Database, label: "ML Training Datasets" },
  { icon: Image, label: "Meme Creation" },
  { icon: Share2, label: "Social Media Content" },
];

export const UseCases = () => {
  return (
    <section className="py-20 border-t border-border flex items-center justify-center">
      <div className="container">
        <h2 className="text-2xl font-mono font-bold text-center mb-12 text-foreground">
          Built For
        </h2>
        <div className="flex flex-wrap justify-center gap-4 max-w-3xl mx-auto">
          {useCases.map((useCase, index) => (
            <div
              key={index}
              className="flex items-center gap-3 px-5 py-3 rounded-lg bg-secondary border border-border hover:border-primary/50 transition-colors duration-200"
            >
              <useCase.icon className="w-5 h-5 text-primary" />
              <span className="font-mono text-sm text-foreground font-medium">
                {useCase.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
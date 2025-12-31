import { Link, ScanEye, Download } from "lucide-react";

const steps = [
  {
    icon: Link,
    title: "Paste YouTube Link", 
    description: "Simply copy and paste the URL of the YouTube video you want to process.",
  },
  {
    icon: ScanEye,
    title: "Auto-Detect Scenes", 
    description: "Our algorithm scans the video to identify every distinct scene change automatically.",
  },
  {
    icon: Download, 
    title: "Download Frames",
    description: "Save individual high-res images or download the entire collection as a ZIP file.",
  },
];

export const HowItWorks = () => {
  return (
    <section className="py-20 border-t border-border flex items-center justify-center">
      <div className="container">
        <h2 className="text-2xl font-mono font-bold text-center mb-12 text-foreground">
          How It Works
        </h2>
        <div className="grid md:grid-cols-3 gap-8 max-w-3xl mx-auto">
          {steps.map((step, index) => (
            <div key={index} className="text-center">
              <div className="w-14 h-14 rounded-lg bg-secondary flex items-center justify-center mx-auto mb-4 border border-border">
                <step.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-mono font-bold text-foreground mb-2">
                {step.title}
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
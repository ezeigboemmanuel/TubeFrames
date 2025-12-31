import { Button } from "@/components/ui/button";
import { ArrowRight, Check, Code, Heart } from "lucide-react";
import Link from "next/link";

export const PricingTeaser = () => {
  return (
    <section className="py-20 border-t border-border flex items-center justify-center">
      <div className="container">
        <div className="max-w-xl mx-auto text-center">
          <h2 className="text-2xl font-mono font-bold mb-4 text-foreground">
            Price: $0.00 (It&apos;s Open Source.)
          </h2>
          <p className="text-muted-foreground mb-8 text-balance">
            I built this because I hate manual screenshots. No subscriptions, 
            no hidden fees, just code. Keep your money.
          </p>

          <div className="bg-card rounded-xl border border-border p-8 mb-8">
            <div className="grid md:grid-cols-2 gap-8">
              {/* Features */}
              <div className="text-left">
                <h3 className="font-mono font-bold text-foreground mb-4 flex items-center gap-2">
                   What you get
                </h3>
                <ul className="space-y-3">
                  {[
                    "HD & 4K Extraction",
                    "One-click ZIP Download",
                    "Unlimited Video Length",
                    "Privacy Focused (Local-ish)",
                  ].map((feature, index) => (
                    <li
                      key={index}
                      className="flex items-center gap-2 text-sm text-muted-foreground"
                    >
                      <Check className="w-4 h-4 text-green-500" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>

              {/* The Cost */}
              <div className="text-left">
                <h3 className="font-mono font-bold text-primary mb-4 flex items-center gap-2">
                   The Cost
                </h3>
                <ul className="space-y-3">
                  {[
                    "$0.00 / month",
                    "No Credit Card",
                    "MIT License",
                    "Maybe give me a Star? ⭐",
                  ].map((feature, index) => (
                    <li
                      key={index}
                      className="flex items-center gap-2 text-sm text-foreground font-medium"
                    >
                      {index === 3 ? (
                        <Heart className="w-4 h-4 text-red-500" />
                      ) : (
                        <Check className="w-4 h-4 text-primary" />
                      )}
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
             {/* GitHub / Repo Link */}
            <Link href="https://github.com/your-username/repo-name" target="_blank">
              <Button variant="default" size="lg" className="font-mono w-full sm:w-auto">
                <Code className="mr-2 h-4 w-4" />
                Steal the Code
              </Button>
            </Link>
            
            {/* Tool Link */}
            <Link href="/dashboard">
              <Button variant="outline" size="lg" className="font-mono w-full sm:w-auto">
                Start Using It
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};
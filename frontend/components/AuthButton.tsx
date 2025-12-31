"use client";
import { Button } from "@/components/ui/button";
import { signIn, signOut, useSession } from "next-auth/react";

export function AuthButton() {
  const { data: session } = useSession();
  console.log("SESSION: ", session)

  if (session) {
    return (
      <div className="flex items-center gap-4">
        <span className="text-sm font-mono text-muted-foreground hidden md:inline">
          {session.user?.email}
        </span>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => signOut()}
          className="font-mono"
        >
          Sign Out
        </Button>
      </div>
    );
  }

  return (
    <Button 
      variant="default" 
      size="sm" 
      onClick={() => signIn("google")}
      className="font-mono"
    >
      Sign In
    </Button>
  );
}
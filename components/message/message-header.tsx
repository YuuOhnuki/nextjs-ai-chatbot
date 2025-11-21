"use client";
import type { ChatMessage } from "@/lib/types";
import { BrainIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface MessageHeaderProps {
  message: ChatMessage;
  className?: string;
}

export function MessageHeader({ message, className }: MessageHeaderProps) {
  if (message.role === "user") {
    return null;
  }

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="flex size-8 items-center justify-center rounded-full bg-primary/10">
        <BrainIcon className="size-4 text-primary" />
      </div>
      <span className="text-sm font-medium text-muted-foreground">Assistant</span>
    </div>
  );
}

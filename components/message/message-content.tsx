"use client";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useTranslation } from "@/hooks/use-translation";
import type { ChatMessage } from "@/lib/types";
import { cn, sanitizeText } from "@/lib/utils";
import { Response } from "@/components/elements/response";
import { Button } from "@/components/ui/button";
import { MessageSquarePlus } from "lucide-react";

interface MessageContentProps {
  message: ChatMessage;
  isLoading?: boolean;
  className?: string;
  onAskQuestion?: (selectedText: string, messageId: string) => void;
}

export function MessageContent({ message, isLoading, className, onAskQuestion }: MessageContentProps) {
  const { t } = useTranslation();
  const [selectedText, setSelectedText] = useState("");
  const [showAskButton, setShowAskButton] = useState(false);

  const getAccentColor = () => {
    const savedAccentColor = localStorage.getItem("accentColor") || "blue";
    const accentColors = {
      blue: "#006cff",
      green: "#10b981",
      purple: "#8b5cf6",
      red: "#ef4444",
      orange: "#f97316",
      pink: "#ec4899",
    };
    return accentColors[savedAccentColor as keyof typeof accentColors] || "#006cff";
  };

  const handleTextSelection = () => {
    const selection = window.getSelection();
    if (selection && selection.toString().trim()) {
      setSelectedText(selection.toString().trim());
      setShowAskButton(true);
    } else {
      setSelectedText("");
      setShowAskButton(false);
    }
  };

  const handleAskQuestion = () => {
    if (selectedText && onAskQuestion) {
      onAskQuestion(selectedText, message.id);
      setSelectedText("");
      setShowAskButton(false);
      window.getSelection()?.removeAllRanges();
    }
  };

  useEffect(() => {
    document.addEventListener("mouseup", handleTextSelection);
    document.addEventListener("keyup", handleTextSelection);
    
    return () => {
      document.removeEventListener("mouseup", handleTextSelection);
      document.removeEventListener("keyup", handleTextSelection);
    };
  }, []);

  const textPart = message.parts.find((part) => part.type === "text");
  
  if (!textPart?.text?.trim()) {
    return null;
  }

  return (
    <div className={cn("relative", className)}>
      {isLoading && message.role === "assistant" ? (
        <div className="flex w-full flex-col gap-2 md:gap-4">
          <div className="flex items-center gap-2">
            <div className="flex space-x-1">
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                className="size-2 rounded-full bg-primary/60"
                transition={{
                  duration: 1.5,
                  repeat: Number.POSITIVE_INFINITY,
                  delay: 0,
                }}
              />
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                className="size-2 rounded-full bg-primary/60"
                transition={{
                  duration: 1.5,
                  repeat: Number.POSITIVE_INFINITY,
                  delay: 0.2,
                }}
              />
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                className="size-2 rounded-full bg-primary/60"
                transition={{
                  duration: 1.5,
                  repeat: Number.POSITIVE_INFINITY,
                  delay: 0.4,
                }}
              />
            </div>
            <span className="text-muted-foreground text-sm">
              {t("thinking")}
            </span>
          </div>
        </div>
      ) : (<div
        className={cn({
          "w-fit break-words rounded-2xl px-3 py-2 text-right text-white":
            message.role === "user",
          "bg-transparent px-0 py-0 text-left select-text":
            message.role === "assistant",
        })}
        data-testid="message-content"
        style={
          message.role === "user"
            ? { backgroundColor: getAccentColor() }
            : undefined
        }
      >
        <Response>{sanitizeText(textPart.text)}</Response>
      </div>)}

        
        {message.role === "assistant" && showAskButton && selectedText && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute top-full left-0 mt-2 z-10"
          >
            <Button
              onClick={handleAskQuestion}
              size="sm"
              variant="outline"
              className="flex items-center gap-2 shadow-md"
            >
              <MessageSquarePlus className="w-3 h-3" />
              {t("askAboutThis")}
            </Button>
          </motion.div>
        )}
    </div>
  );
}

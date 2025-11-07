"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { type ToolMetadata } from "@/lib/tools-metadata";
import { useTranslation } from "@/hooks/useTranslation";

interface ToolSelectorDialogProps {
  tool: ToolMetadata | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (input: string) => void;
}

export function ToolSelectorDialog({ tool, open, onOpenChange, onSubmit }: ToolSelectorDialogProps) {
  const [input, setInput] = useState("");
  const { t } = useTranslation();

  const handleSubmit = () => {
    if (input.trim()) {
      onSubmit(input.trim());
      setInput("");
      onOpenChange(false);
    }
  };

  const getPlaceholder = (toolId: string) => {
    switch (toolId) {
      case 'get-weather':
        return "Enter city name (e.g., Tokyo, New York)";
      case 'create-document':
        return "Enter document title";
      case 'update-document':
        return "Enter document ID and content";
      case 'request-suggestions':
        return "Describe what you need suggestions for";
      default:
        return "Enter your request";
    }
  };

  if (!tool) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t(tool.nameKey as any)}</DialogTitle>
          <DialogDescription>{t(tool.descriptionKey as any)}</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="tool-input" className="text-right">
              {t("toolInputLabel")}
            </Label>
            <Input
              id="tool-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={getPlaceholder(tool.id)}
              className="col-span-3"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSubmit();
                }
              }}
            />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleSubmit} disabled={!input.trim()}>
            {t("toolExecuteButton")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

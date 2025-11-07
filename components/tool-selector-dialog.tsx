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
import { useTranslation } from "@/hooks/use-translation";
import type { ToolMetadata } from "@/lib/tools-metadata";

type ToolSelectorDialogProps = {
  tool: ToolMetadata | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (input: string) => void;
};

export function ToolSelectorDialog({
  tool,
  open,
  onOpenChange,
  onSubmit,
}: ToolSelectorDialogProps) {
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
      case "get-weather":
        return t("weatherPlaceholder");
      case "create-document":
        return t("createDocumentPlaceholder");
      case "update-document":
        return t("updateDocumentPlaceholder");
      case "request-suggestions":
        return t("requestSuggestionsPlaceholder");
      default:
        return t("defaultToolPlaceholder");
    }
  };

  if (!tool) {
    return null;
  }

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t(tool.nameKey as any)}</DialogTitle>
          <DialogDescription>{t(tool.descriptionKey as any)}</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="tool-input">
              {t("toolInputLabel")}
            </Label>
            <Input
              id="tool-input"
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSubmit();
                }
              }}
              placeholder={getPlaceholder(tool.id)}
              value={input}
            />
          </div>
        </div>
        <DialogFooter>
          <Button disabled={!input.trim()} onClick={handleSubmit}>
            {t("toolExecuteButton")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

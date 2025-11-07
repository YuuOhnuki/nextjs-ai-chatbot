"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Grid3x3, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useTranslation } from "@/hooks/use-translation";
import { type ToolMetadata, toolMetadata } from "@/lib/tools-metadata";

export function ToolApps({
  onToolSelect,
}: {
  onToolSelect: (tool: ToolMetadata) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useTranslation();

  return (
    <div className="fixed top-4 right-4 z-50 hidden lg:block">
      <Button
        className="h-12 w-12 rounded-full shadow-lg"
        onClick={() => setIsOpen(!isOpen)}
        size="icon"
        variant="ghost"
      >
        {isOpen ? <X size={24} /> : <Grid3x3 size={24} />}
      </Button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="absolute top-14 right-0 max-h-96 w-120 overflow-y-auto rounded-lg border bg-background p-4 shadow-xl"
            exit={{ opacity: 0, scale: 0.8, y: -10 }}
            initial={{ opacity: 0, scale: 0.8, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <div className="grid grid-cols-2 gap-3">
              {toolMetadata.map((tool) => {
                const IconComponent = tool.icon;
                return (
                  <Card
                    className="cursor-pointer transition-shadow hover:shadow-md"
                    key={tool.id}
                    onClick={() => {
                      onToolSelect(tool);
                      setIsOpen(false);
                    }}
                  >
                    <CardHeader className="p-3 pb-2">
                      <div className="flex items-center gap-2">
                        <IconComponent className="text-primary" size={24} />
                        <CardTitle className="font-medium text-sm">
                          {t(tool.nameKey as any)}
                        </CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="p-3 pt-0">
                      <CardDescription className="text-xs">
                        {t(tool.descriptionKey as any)}
                      </CardDescription>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

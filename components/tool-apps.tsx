"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toolMetadata, type ToolMetadata } from "@/lib/tools-metadata";
import { useTranslation } from "@/hooks/useTranslation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Grid3x3, X } from "lucide-react";

export function ToolApps({ onToolSelect }: { onToolSelect: (tool: ToolMetadata) => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useTranslation();

  return (
    <div className="fixed top-4 right-4 z-50 hidden lg:block">
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className="h-12 w-12 rounded-full shadow-lg"
        variant="ghost"
        size="icon"
      >
        {isOpen ? <X size={24} /> : <Grid3x3 size={24} />}
      </Button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute top-14 right-0 w-120 max-h-96 overflow-y-auto bg-background border rounded-lg shadow-xl p-4"
          >
            <div className="grid grid-cols-2 gap-3">
              {toolMetadata.map((tool) => {
                const IconComponent = tool.icon;
                return (
                  <Card
                    key={tool.id}
                    className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => {
                      onToolSelect(tool);
                      setIsOpen(false);
                    }}
                  >
                    <CardHeader className="p-3 pb-2">
                      <div className="flex items-center gap-2">
                        <IconComponent size={24} className="text-primary" />
                        <CardTitle className="text-sm font-medium">
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

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem
} from "@/components/ui/dropdown-menu";
import { 
  Search, 
  Bot, 
  Settings, 
  Globe, 
  Zap, 
  Check,
  ChevronDown 
} from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";

interface ChatOptionsProps {
  onWebSearchToggle?: (enabled: boolean) => void;
  onAgentToggle?: (enabled: boolean) => void;
  webSearchEnabled?: boolean;
  agentEnabled?: boolean;
  isReadonly?: boolean;
}

export function ChatOptions({
  onWebSearchToggle,
  onAgentToggle,
  webSearchEnabled = false,
  agentEnabled = false,
  isReadonly = false
}: ChatOptionsProps) {
  const { t } = useTranslation();
  const [localWebSearch, setLocalWebSearch] = useState(webSearchEnabled);
  const [localAgent, setLocalAgent] = useState(agentEnabled);

  const handleWebSearchToggle = (enabled: boolean) => {
    if (isReadonly) return;
    setLocalWebSearch(enabled);
    onWebSearchToggle?.(enabled);
  };

  const handleAgentToggle = (enabled: boolean) => {
    if (isReadonly) return;
    setLocalAgent(enabled);
    onAgentToggle?.(enabled);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-8 w-8 p-0"
          disabled={isReadonly}
        >
          <Settings className="w-4 h-4" />
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-64">
        <div className="p-2 space-y-2">
          <div className="text-xs font-medium text-muted-foreground mb-2">
            {t("enableFeatures")}
          </div>
          
          {/* Web Search Option */}
          <DropdownMenuCheckboxItem
            checked={localWebSearch}
            onCheckedChange={handleWebSearchToggle}
            disabled={isReadonly}
            className="flex items-center gap-2 p-2 cursor-pointer"
          >
            <div className="flex items-center gap-2 flex-1">
              <Search className="w-4 h-4" />
              <div className="flex flex-col">
                <span className="text-sm font-medium">{t("webSearch")}</span>
                <span className="text-xs text-muted-foreground">
                  {t("webSearchDescription")}
                </span>
              </div>
            </div>
            {localWebSearch && <Check className="w-4 h-4 text-green-600" />}
          </DropdownMenuCheckboxItem>
          
          {/* Agent System Option */}
          <DropdownMenuCheckboxItem
            checked={localAgent}
            onCheckedChange={handleAgentToggle}
            disabled={isReadonly}
            className="flex items-center gap-2 p-2 cursor-pointer"
          >
            <div className="flex items-center gap-2 flex-1">
              <Bot className="w-4 h-4" />
              <div className="flex flex-col">
                <span className="text-sm font-medium">{t("agentSystem")}</span>
                <span className="text-xs text-muted-foreground">
                  {t("agentSystemDescription")}
                </span>
              </div>
            </div>
            {localAgent && <Check className="w-4 h-4 text-green-600" />}
          </DropdownMenuCheckboxItem>
        </div>
        
        <DropdownMenuSeparator />
        
        {/* Status Display */}
        <div className="p-2">
          <div className="text-xs font-medium text-muted-foreground mb-2">
            {t("currentStatus")}
          </div>
          <div className="flex flex-wrap gap-1">
            {localWebSearch && (
              <Badge variant="secondary" className="text-xs">
                <Globe className="w-3 h-3 mr-1" />
                {t("webSearch")}
              </Badge>
            )}
            {localAgent && (
              <Badge variant="secondary" className="text-xs">
                <Bot className="w-3 h-3 mr-1" />
                {t("agent")}
              </Badge>
            )}
            {!localWebSearch && !localAgent && (
              <span className="text-xs text-muted-foreground">
                {t("noFeaturesEnabled")}
              </span>
            )}
          </div>
        </div>
        
        <DropdownMenuSeparator />
        
        {/* Quick Actions */}
        <div className="p-2">
          <div className="text-xs font-medium text-muted-foreground mb-2">
            {t("quickActions")}
          </div>
          <div className="space-y-1">
            <DropdownMenuItem
              onClick={() => {
                handleWebSearchToggle(true);
                handleAgentToggle(true);
              }}
              disabled={isReadonly}
              className="text-xs cursor-pointer"
            >
              <Zap className="w-3 h-3 mr-2" />
              {t("enableAll")}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                handleWebSearchToggle(false);
                handleAgentToggle(false);
              }}
              disabled={isReadonly}
              className="text-xs cursor-pointer"
            >
              <Settings className="w-3 h-3 mr-2" />
              {t("disableAll")}
            </DropdownMenuItem>
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// Compact version for smaller spaces
export function CompactChatOptions({
  onWebSearchToggle,
  onAgentToggle,
  webSearchEnabled = false,
  agentEnabled = false,
  isReadonly = false
}: ChatOptionsProps) {
  const { t } = useTranslation();

  return (
    <div className="flex items-center gap-1">
      {/* Web Search Toggle */}
      <Button
        variant={webSearchEnabled ? "default" : "outline"}
        size="sm"
        onClick={() => onWebSearchToggle?.(!webSearchEnabled)}
        disabled={isReadonly}
        className="h-7 px-2 text-xs"
      >
        <Search className="w-3 h-3 mr-1" />
        {t("web")}
      </Button>
      
      {/* Agent Toggle */}
      <Button
        variant={agentEnabled ? "default" : "outline"}
        size="sm"
        onClick={() => onAgentToggle?.(!agentEnabled)}
        disabled={isReadonly}
        className="h-7 px-2 text-xs"
      >
        <Bot className="w-3 h-3 mr-1" />
        {t("agent")}
      </Button>
    </div>
  );
}

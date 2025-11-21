"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Copy, Check, ArrowRightLeft, Code, Play } from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";
import { supportedLanguages, type SupportedLanguage } from "@/lib/ai/tools/convert-code";

interface CodeConverterProps {
  initialCode?: string;
  initialLanguage?: SupportedLanguage;
  onConvert?: (result: ConversionResult) => void;
  isReadonly?: boolean;
}

interface ConversionResult {
  originalCode: string;
  originalLanguage: string;
  targetLanguage: string;
  convertedCode: string;
  optimized: boolean;
  hasComments: boolean;
}

export function CodeConverter({ 
  initialCode = "", 
  initialLanguage = "javascript",
  onConvert,
  isReadonly = false 
}: CodeConverterProps) {
  const { t } = useTranslation();
  const [sourceCode, setSourceCode] = useState(initialCode);
  const [sourceLanguage, setSourceLanguage] = useState<SupportedLanguage>(initialLanguage);
  const [targetLanguage, setTargetLanguage] = useState<SupportedLanguage>("python");
  const [optimize, setOptimize] = useState(true);
  const [addComments, setAddComments] = useState(false);
  const [convertedCode, setConvertedCode] = useState("");
  const [isConverting, setIsConverting] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleConvert = async () => {
    if (!sourceCode.trim() || isReadonly) return;

    setIsConverting(true);
    
    try {
      // Simulate API call for code conversion
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Placeholder conversion - in reality, this would call the AI tool
      const result = await performMockConversion(
        sourceCode,
        sourceLanguage,
        targetLanguage,
        optimize,
        addComments
      );
      
      setConvertedCode(result.convertedCode);
      onConvert?.(result);
    } catch (error) {
      console.error("Conversion failed:", error);
    } finally {
      setIsConverting(false);
    }
  };

  const handleSwapLanguages = () => {
    if (isReadonly) return;
    setSourceLanguage(targetLanguage);
    setTargetLanguage(sourceLanguage);
    setConvertedCode("");
  };

  const handleCopy = async () => {
    if (!convertedCode) return;
    
    try {
      await navigator.clipboard.writeText(convertedCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };

  const getLanguageIcon = (language: string) => {
    return <Code className="w-4 h-4" />;
  };

  return (
    <Card className="w-full max-w-6xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ArrowRightLeft className="w-5 h-5" />
          {t("codeConverter")}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Language Selection */}
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <Label htmlFor="source-lang">{t("from")}</Label>
            <Select value={sourceLanguage} onValueChange={(value: SupportedLanguage) => setSourceLanguage(value)} disabled={isReadonly}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {supportedLanguages.map((lang) => (
                  <SelectItem key={lang} value={lang}>
                    <div className="flex items-center gap-2">
                      {getLanguageIcon(lang)}
                      {lang}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <Button
            variant="outline"
            size="icon"
            onClick={handleSwapLanguages}
            disabled={isReadonly}
            className="mt-6"
          >
            <ArrowRightLeft className="w-4 h-4" />
          </Button>
          
          <div className="flex-1">
            <Label htmlFor="target-lang">{t("to")}</Label>
            <Select value={targetLanguage} onValueChange={(value: SupportedLanguage) => setTargetLanguage(value)} disabled={isReadonly}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {supportedLanguages.map((lang) => (
                  <SelectItem key={lang} value={lang}>
                    <div className="flex items-center gap-2">
                      {getLanguageIcon(lang)}
                      {lang}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Options */}
        <div className="flex items-center gap-6">
          <div className="flex items-center space-x-2">
            <Switch
              id="optimize"
              checked={optimize}
              onCheckedChange={setOptimize}
              disabled={isReadonly}
            />
            <Label htmlFor="optimize">{t("optimizeCode")}</Label>
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch
              id="comments"
              checked={addComments}
              onCheckedChange={setAddComments}
              disabled={isReadonly}
            />
            <Label htmlFor="comments">{t("addComments")}</Label>
          </div>
        </div>

        {/* Code Input/Output */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Source Code */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>{t("sourceCode")}</Label>
              <Badge variant="outline">{sourceLanguage}</Badge>
            </div>
            <Textarea
              value={sourceCode}
              onChange={(e) => setSourceCode(e.target.value)}
              placeholder={t("enterSourceCode")}
              className="min-h-[300px] font-mono text-sm"
              disabled={isReadonly}
            />
          </div>

          {/* Converted Code */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>{t("convertedCode")}</Label>
              <div className="flex items-center gap-2">
                <Badge variant="outline">{targetLanguage}</Badge>
                {convertedCode && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCopy}
                    className="h-6 px-2"
                  >
                    {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  </Button>
                )}
              </div>
            </div>
            <Textarea
              value={convertedCode}
              readOnly
              placeholder={t("convertedCodePlaceholder")}
              className="min-h-[300px] font-mono text-sm"
            />
          </div>
        </div>

        {/* Convert Button */}
        <div className="flex justify-center">
          <Button
            onClick={handleConvert}
            disabled={!sourceCode.trim() || isConverting || isReadonly}
            className="min-w-[120px]"
          >
            {isConverting ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              >
                <Play className="w-4 h-4" />
              </motion.div>
            ) : (
              <ArrowRightLeft className="w-4 h-4 mr-2" />
            )}
            {isConverting ? t("converting") : t("convert")}
          </Button>
        </div>

        {/* Conversion Info */}
        {convertedCode && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-muted rounded-lg"
          >
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>{t("conversionCompleted")}</span>
              {optimize && <Badge variant="secondary">{t("optimized")}</Badge>}
              {addComments && <Badge variant="secondary">{t("withComments")}</Badge>}
            </div>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}

// Mock conversion function - replace with actual AI tool call
async function performMockConversion(
  sourceCode: string,
  sourceLanguage: string,
  targetLanguage: string,
  optimize: boolean,
  addComments: boolean
): Promise<ConversionResult> {
  // Simple mock conversion logic
  let convertedCode = sourceCode;

  if (sourceLanguage === "javascript" && targetLanguage === "python") {
    convertedCode = sourceCode
      .replace(/console\.log/g, "print")
      .replace(/const /g, "")
      .replace(/let /g, "")
      .replace(/function /g, "def ")
      .replace(/=>/g, ":")
      .replace(/{/g, "")
      .replace(/}/g, "")
      .replace(/\/\//g, "#");
  } else if (sourceLanguage === "python" && targetLanguage === "javascript") {
    convertedCode = sourceCode
      .replace(/print/g, "console.log")
      .replace(/def /g, "function ")
      .replace(/#/g, "//");
  }

  if (addComments) {
    convertedCode = `// Converted from ${sourceLanguage} to ${targetLanguage}\n${convertedCode}`;
  }

  return {
    originalCode: sourceCode,
    originalLanguage: sourceLanguage,
    targetLanguage,
    convertedCode,
    optimized: optimize,
    hasComments: addComments
  };
}

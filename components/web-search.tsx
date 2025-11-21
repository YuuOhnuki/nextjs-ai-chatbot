"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Search, Clock, Calendar, Globe, Filter } from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";
import type { SearchResult, WebSearchResponse } from "@/lib/ai/tools/web-search";

interface WebSearchProps {
  onSearch?: (query: string, options: SearchOptions) => void;
  isReadonly?: boolean;
}

interface SearchOptions {
  searchType: "web" | "news" | "images" | "videos";
  maxResults: number;
  language: string;
  region?: string;
  safeSearch: "off" | "moderate" | "strict";
  sortBy: "relevance" | "date" | "rating";
  timeRange: "any" | "day" | "week" | "month" | "year";
}

export function WebSearch({ onSearch, isReadonly = false }: WebSearchProps) {
  const { t } = useTranslation();
  const [query, setQuery] = useState("");
  const [searchOptions, setSearchOptions] = useState<SearchOptions>({
    searchType: "web",
    maxResults: 10,
    language: "en",
    safeSearch: "moderate",
    sortBy: "relevance",
    timeRange: "any"
  });
  const [searchResults, setSearchResults] = useState<WebSearchResponse | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleSearch = async () => {
    if (!query.trim() || isReadonly) return;

    setIsSearching(true);
    
    try {
      // Simulate API call for web search
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock search results - replace with actual API call
      const mockResults = await performMockSearch(query, searchOptions);
      setSearchResults(mockResults);
      onSearch?.(query, searchOptions);
    } catch (error) {
      console.error("Search failed:", error);
    } finally {
      setIsSearching(false);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const getDomainFromUrl = (url: string) => {
    try {
      return new URL(url).hostname;
    } catch {
      return url;
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="w-5 h-5" />
          {t("webSearch")}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Search Input */}
        <div className="flex gap-2">
          <div className="flex-1">
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t("searchPlaceholder")}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              disabled={isReadonly}
            />
          </div>
          <Button
            onClick={handleSearch}
            disabled={!query.trim() || isSearching || isReadonly}
            className="min-w-[100px]"
          >
            {isSearching ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              >
                <Search className="w-4 h-4" />
              </motion.div>
            ) : (
              <Search className="w-4 h-4 mr-2" />
            )}
            {t("search")}
          </Button>
        </div>

        {/* Advanced Options Toggle */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowAdvanced(!showAdvanced)}
            disabled={isReadonly}
            className="flex items-center gap-2"
          >
            <Filter className="w-4 h-4" />
            {t("advancedOptions")}
          </Button>
        </div>

        {/* Advanced Options */}
        {showAdvanced && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-4 p-4 bg-muted rounded-lg"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">{t("searchType")}</label>
                <Select
                  value={searchOptions.searchType}
                  onValueChange={(value: any) => setSearchOptions(prev => ({ ...prev, searchType: value }))}
                  disabled={isReadonly}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="web">{t("web")}</SelectItem>
                    <SelectItem value="news">{t("news")}</SelectItem>
                    <SelectItem value="images">{t("images")}</SelectItem>
                    <SelectItem value="videos">{t("videos")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">{t("maxResults")}</label>
                <Select
                  value={searchOptions.maxResults.toString()}
                  onValueChange={(value) => setSearchOptions(prev => ({ ...prev, maxResults: parseInt(value) }))}
                  disabled={isReadonly}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5</SelectItem>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="15">15</SelectItem>
                    <SelectItem value="20">20</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">{t("sortBy")}</label>
                <Select
                  value={searchOptions.sortBy}
                  onValueChange={(value: any) => setSearchOptions(prev => ({ ...prev, sortBy: value }))}
                  disabled={isReadonly}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="relevance">{t("relevance")}</SelectItem>
                    <SelectItem value="date">{t("date")}</SelectItem>
                    <SelectItem value="rating">{t("rating")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">{t("timeRange")}</label>
                <Select
                  value={searchOptions.timeRange}
                  onValueChange={(value: any) => setSearchOptions(prev => ({ ...prev, timeRange: value }))}
                  disabled={isReadonly}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">{t("anyTime")}</SelectItem>
                    <SelectItem value="day">{t("lastDay")}</SelectItem>
                    <SelectItem value="week">{t("lastWeek")}</SelectItem>
                    <SelectItem value="month">{t("lastMonth")}</SelectItem>
                    <SelectItem value="year">{t("lastYear")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">{t("safeSearch")}</label>
                <Select
                  value={searchOptions.safeSearch}
                  onValueChange={(value: any) => setSearchOptions(prev => ({ ...prev, safeSearch: value }))}
                  disabled={isReadonly}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="off">{t("off")}</SelectItem>
                    <SelectItem value="moderate">{t("moderate")}</SelectItem>
                    <SelectItem value="strict">{t("strict")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </motion.div>
        )}

        {/* Search Results */}
        {searchResults && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">
                {t("searchResults")} ({searchResults.totalResults})
              </h3>
              <Badge variant="outline" className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {searchResults.searchTime}s
              </Badge>
            </div>

            <div className="space-y-4">
              {searchResults.results.map((result, index) => (
                <motion.div
                  key={`${result.url}-${index}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="p-4 hover:shadow-md transition-shadow">
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-medium text-blue-600 hover:text-blue-800 cursor-pointer">
                          <a href={result.url} target="_blank" rel="noopener noreferrer">
                            {result.title}
                          </a>
                        </h4>
                        <Button
                          variant="ghost"
                          size="sm"
                          asChild
                        >
                          <a href={result.url} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        </Button>
                      </div>
                      
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {result.snippet}
                      </p>
                      
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <Badge variant="outline" className="flex items-center gap-1">
                          <Globe className="w-3 h-3" />
                          {getDomainFromUrl(result.url)}
                        </Badge>
                        
                        {result.publishedDate && (
                          <Badge variant="outline" className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {formatDate(result.publishedDate)}
                          </Badge>
                        )}
                        
                        {result.relevanceScore && (
                          <Badge variant="outline">
                            {Math.round(result.relevanceScore * 100)}% {t("relevant")}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>

            {searchResults.hasMore && (
              <div className="flex justify-center pt-4">
                <Button variant="outline">
                  {t("loadMoreResults")}
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Mock search function - replace with actual API call
async function performMockSearch(query: string, options: SearchOptions): Promise<WebSearchResponse> {
  // Generate mock results based on the query
  const mockResults: SearchResult[] = Array.from({ length: options.maxResults }, (_, i) => ({
    title: `Search result ${i + 1} for "${query}"`,
    url: `https://example.com/result-${i + 1}`,
    snippet: `This is result ${i + 1} with relevant information about ${query}. It contains comprehensive details and insights that would be helpful for understanding the topic better.`,
    domain: "example.com",
    publishedDate: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
    relevanceScore: 0.9 - (i * 0.1)
  }));

  return {
    query,
    results: mockResults,
    totalResults: mockResults.length + Math.floor(Math.random() * 100),
    searchTime: 0.5,
    hasMore: mockResults.length < 50
  };
}

import { Cloud, Edit, FileText, Lightbulb } from "lucide-react";

export type ToolMetadata = {
  id: string;
  name: string;
  nameKey: string;
  description: string;
  descriptionKey: string;
  icon: React.ComponentType<any>;
  category: "utility" | "content" | "information";
};

export const toolMetadata: ToolMetadata[] = [
  {
    id: "get-weather",
    name: "Weather",
    nameKey: "toolWeather",
    description: "Get current weather information",
    descriptionKey: "toolWeatherDesc",
    icon: Cloud,
    category: "information",
  },
  {
    id: "create-document",
    name: "Create Document",
    nameKey: "toolCreateDocument",
    description: "Create a new document",
    descriptionKey: "toolCreateDocumentDesc",
    icon: FileText,
    category: "content",
  },
  {
    id: "update-document",
    name: "Update Document",
    nameKey: "toolUpdateDocument",
    description: "Update existing document",
    descriptionKey: "toolUpdateDocumentDesc",
    icon: Edit,
    category: "content",
  },
  {
    id: "request-suggestions",
    name: "Get Suggestions",
    nameKey: "toolSuggestions",
    description: "Get AI suggestions",
    descriptionKey: "toolSuggestionsDesc",
    icon: Lightbulb,
    category: "utility",
  },
];

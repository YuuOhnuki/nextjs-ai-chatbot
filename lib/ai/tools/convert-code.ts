import { tool } from "ai";
import { z } from "zod";

export const convertCode = tool({
  description:
    "Convert code from one programming language to another. Supports popular programming languages with syntax highlighting and optimization.",
  inputSchema: z.object({
    sourceCode: z.string().describe("The source code to convert"),
    sourceLanguage: z.string().describe("The source programming language (e.g., 'javascript', 'python', 'java', 'cpp')"),
    targetLanguage: z.string().describe("The target programming language to convert to"),
    optimize: z.boolean().default(true).describe("Whether to optimize the converted code"),
    addComments: z.boolean().default(false).describe("Whether to add explanatory comments"),
  }),
  execute: async (input) => {
    try {
      // This is a placeholder implementation
      // In a real application, you would use an AI service to perform the conversion
      const convertedCode = await performCodeConversion(
        input.sourceCode,
        input.sourceLanguage,
        input.targetLanguage,
        input.optimize,
        input.addComments
      );

      return {
        success: true,
        originalCode: input.sourceCode,
        originalLanguage: input.sourceLanguage,
        targetLanguage: input.targetLanguage,
        convertedCode,
        optimized: input.optimize,
        hasComments: input.addComments,
        message: `Successfully converted code from ${input.sourceLanguage} to ${input.targetLanguage}`
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to convert code: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  },
});

async function performCodeConversion(
  sourceCode: string,
  sourceLanguage: string,
  targetLanguage: string,
  optimize: boolean,
  addComments: boolean
): Promise<string> {
  // Placeholder implementation - in reality, this would use AI for conversion
  const conversions: Record<string, Record<string, string>> = {
    "javascript->python": {
      "console.log": "print",
      "const": "",
      "let": "",
      "var": "",
      "function": "def",
      "=>": ":",
      "{": "",
      "}": "",
      "//": "#",
      "/*": '"""',
      "*/": '"""'
    },
    "python->javascript": {
      "print": "console.log",
      "def": "function",
      "#": "//",
      '"""': "/*"
    }
  };

  const conversionKey = `${sourceLanguage}->${targetLanguage}`;
  const rules = conversions[conversionKey] || {};

  let convertedCode = sourceCode;
  
  // Apply basic conversion rules
  Object.entries(rules).forEach(([from, to]) => {
    const regex = new RegExp(from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
    convertedCode = convertedCode.replace(regex, to);
  });

  if (addComments) {
    convertedCode = `// Converted from ${sourceLanguage} to ${targetLanguage}\n${convertedCode}`;
  }

  return convertedCode;
}

export const supportedLanguages = [
  "javascript",
  "typescript", 
  "python",
  "java",
  "cpp",
  "csharp",
  "ruby",
  "go",
  "rust",
  "php",
  "swift",
  "kotlin",
  "scala",
  "r",
  "sql",
  "html",
  "css"
] as const;

export type SupportedLanguage = typeof supportedLanguages[number];

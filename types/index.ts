// Re-export all types from lib
export type { ChatMessage, ChatTools, CustomUIDataTypes } from "@/lib/types";
export type { 
  User, 
  Chat, 
  DBMessage, 
  Vote, 
  Document, 
  Suggestion, 
  Stream 
} from "@/lib/db/schema";

// Additional types for better type safety
export interface MessagePart {
  type: "text" | "file" | "tool-invocation" | "reasoning";
  text?: string;
  url?: string;
  filename?: string;
  mediaType?: string;
  toolInvocation?: {
    toolName: string;
    args: Record<string, unknown>;
    result?: unknown;
    state: "call" | "partial-call" | "result";
  };
}

export interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  parts: MessagePart[];
  createdAt?: string;
  metadata?: {
    [key: string]: unknown;
  };
}

export interface ChatSession {
  id: string;
  userId: string;
  title: string;
  visibility: "public" | "private";
  createdAt: Date;
  updatedAt: Date;
  lastContext?: unknown;
}

export interface UserSession {
  id: string;
  email: string;
  type: "guest" | "regular";
  name?: string;
  image?: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };
}

export interface FileUpload {
  file: File;
  url: string;
  name: string;
  type: string;
  size: number;
}

export interface ToolResult {
  toolName: string;
  args: Record<string, unknown>;
  result: unknown;
  state: "call" | "partial-call" | "result";
}

export interface ChatContext {
  messages: Message[];
  userId: string;
  chatId: string;
  settings: {
    model: string;
    temperature: number;
    maxTokens: number;
  };
}

export interface StreamingResponse {
  id: string;
  event: string;
  data: unknown;
}

// Type guards
export function isTextPart(part: MessagePart): part is MessagePart & { type: "text"; text: string } {
  return part.type === "text" && typeof part.text === "string";
}

export function isFilePart(part: MessagePart): part is MessagePart & { type: "file"; url: string; filename: string; mediaType: string } {
  return part.type === "file" && 
         typeof part.url === "string" && 
         typeof part.filename === "string" && 
         typeof part.mediaType === "string";
}

export function isToolInvocationPart(part: MessagePart): part is MessagePart & { type: "tool-invocation"; toolInvocation: NonNullable<MessagePart["toolInvocation"]> } {
  return part.type === "tool-invocation" && part.toolInvocation !== undefined;
}

export function isReasoningPart(part: MessagePart): part is MessagePart & { type: "reasoning"; text: string } {
  return part.type === "reasoning" && typeof part.text === "string";
}

// Utility types
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

export type OptionalFields<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

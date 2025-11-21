import { z } from 'zod';

// Message validation schemas
export const messageContentSchema = z.object({
  text: z.string().min(1).max(10000),
  type: z.literal('text'),
});

export const messageAttachmentSchema = z.object({
  type: z.enum(['file', 'image', 'video', 'document']),
  url: z.string().url(),
  filename: z.string().min(1).max(255),
  mediaType: z.string().min(1).max(100),
  size: z.number().positive().max(50 * 1024 * 1024), // 50MB max
});

export const messageSchema = z.object({
  id: z.string().uuid(),
  role: z.enum(['user', 'assistant', 'system']),
  parts: z.array(z.union([messageContentSchema, messageAttachmentSchema])),
});

export const chatMessageSchema = z.object({
  messages: z.array(messageSchema).min(1).max(100),
  chatId: z.string().uuid().optional(),
});

// User validation schemas
export const userCredentialsSchema = z.object({
  email: z.string().email().max(255),
  password: z.string().min(8).max(128).regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
    'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
  ),
});

export const userRegistrationSchema = userCredentialsSchema.extend({
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

// Chat validation schemas
export const chatTitleSchema = z.object({
  title: z.string().min(1).max(100),
});

export const chatVisibilitySchema = z.object({
  visibility: z.enum(['public', 'private']),
});

// Vote validation schemas
export const voteSchema = z.object({
  chatId: z.string().uuid(),
  messageId: z.string().uuid(),
  type: z.enum(['up', 'down']),
});

// Document validation schemas
export const documentSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1).max(255),
  kind: z.enum(['code', 'image', 'sheet', 'text']),
  content: z.string().min(1).max(1000000), // 1MB max
});

// API request validation schemas
export const apiRequestSchema = z.object({
  method: z.enum(['GET', 'POST', 'PUT', 'DELETE', 'PATCH']),
  headers: z.record(z.string()).optional(),
  body: z.unknown().optional(),
});

export type MessageContent = z.infer<typeof messageContentSchema>;
export type MessageAttachment = z.infer<typeof messageAttachmentSchema>;
export type ChatMessage = z.infer<typeof chatMessageSchema>;
export type UserCredentials = z.infer<typeof userCredentialsSchema>;
export type UserRegistration = z.infer<typeof userRegistrationSchema>;
export type ChatTitle = z.infer<typeof chatTitleSchema>;
export type ChatVisibility = z.infer<typeof chatVisibilitySchema>;
export type Vote = z.infer<typeof voteSchema>;
export type Document = z.infer<typeof documentSchema>;

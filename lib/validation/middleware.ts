import { type NextRequest, NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { ChatSDKError } from '@/lib/errors';
import type { ErrorCode } from '@/lib/errors';

export function validateRequest<T>(schema: any, data: unknown): T {
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof ZodError) {
      const errorMessages = error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message,
      }));
      
      throw new ChatSDKError(
        'bad_request:api',
        `Validation failed: ${JSON.stringify(errorMessages)}`
      );
    }
    throw new ChatSDKError('bad_request:api', 'Invalid request data');
  }
}

export function createValidationMiddleware(schema: any) {
  return async (request: NextRequest) => {
    try {
      const body = await request.json().catch(() => null);
      if (body) {
        validateRequest(schema, body);
      }
      return NextResponse.next();
    } catch (error) {
      if (error instanceof ChatSDKError) {
        return error.toResponse();
      }
      return new ChatSDKError('bad_request:api', 'Request validation failed').toResponse();
    }
  };
}

export function sanitizeInput(input: string): string {
  if (!input) return '';
  
  // Remove potentially dangerous characters
  return input
    .replace(/[<>]/g, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+=/gi, '')
    .replace(/data:/gi, '')
    .trim()
    .substring(0, 10000); // Limit length
}

export function validateFileUpload(file: File): { valid: boolean; error?: string } {
  const maxSize = 50 * 1024 * 1024; // 50MB
  const allowedTypes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf',
    'text/plain',
    'text/csv',
    'application/json',
  ];

  if (file.size > maxSize) {
    return { valid: false, error: 'File size exceeds 50MB limit' };
  }

  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: 'File type not allowed' };
  }

  // Check file name for dangerous patterns
  const dangerousPatterns = [/\.\./, /[<>]/, /[|&;$/]/];
  if (dangerousPatterns.some(pattern => pattern.test(file.name))) {
    return { valid: false, error: 'Invalid file name' };
  }

  return { valid: true };
}

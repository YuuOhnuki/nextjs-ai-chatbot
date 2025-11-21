import { z } from "zod";

// Environment variable schema with validation
const envSchema = z.object({
  // Authentication
  AUTH_SECRET: z.string().min(32, "AUTH_SECRET must be at least 32 characters"),
  NEXTAUTH_URL: z.string().url().optional(),
  
  // Database
  POSTGRES_URL: z.string().url("POSTGRES_URL must be a valid URL"),
  POSTGRES_PRISMA_URL: z.string().url().optional(),
  POSTGRES_URL_NON_POOLING: z.string().url().optional(),
  
  // AI Services
  GOOGLE_GENERATIVE_AI_API_KEY: z.string().min(1, "Google AI API key is required"),
  AI_GATEWAY_API_KEY: z.string().optional(),
  
  // OAuth Providers
  GOOGLE_CLIENT_ID: z.string().min(1, "Google Client ID is required"),
  GOOGLE_CLIENT_SECRET: z.string().min(1, "Google Client Secret is required"),
  GITHUB_ID: z.string().min(1, "GitHub Client ID is required"),
  GITHUB_SECRET: z.string().min(1, "GitHub Client Secret is required"),
  
  // Storage
  BLOB_READ_WRITE_TOKEN: z.string().min(1, "Blob storage token is required"),
  
  // Application
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.string().transform(Number).default("3000"),
  
  // Analytics (optional)
  VERCEL_ANALYTICS_ID: z.string().optional(),
  
  // Redis (optional)
  REDIS_URL: z.string().url().optional(),
  REDIS_TOKEN: z.string().optional(),
});

// Validate environment variables
function validateEnv() {
  try {
    return envSchema.parse(process.env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missingVars = error.errors.map(err => `${err.path.join('.')}: ${err.message}`);
      throw new Error(`Environment validation failed:\n${missingVars.join('\n')}`);
    }
    throw error;
  }
}

// Export validated environment variables
export const env = validateEnv();

// Export type for use in other files
export type Env = z.infer<typeof envSchema>;

// Helper function to check if a feature is enabled
export function isFeatureEnabled(feature: keyof Env): boolean {
  return Boolean(env[feature]);
}

// Helper to get environment-specific values
export function getEnvVar(key: keyof Env): string {
  const value = env[key];
  if (typeof value === 'string') {
    return value;
  }
  throw new Error(`Environment variable ${key} is not a string`);
}

// Development-only checks
if (env.NODE_ENV === "development") {
  console.log("Environment variables validated successfully");
  
  // Warn about missing optional but recommended variables
  const recommendedVars = ["AI_GATEWAY_API_KEY", "REDIS_URL"];
  const missingRecommended = recommendedVars.filter(varName => !process.env[varName]);
  
  if (missingRecommended.length > 0) {
    console.warn(`Recommended environment variables are missing: ${missingRecommended.join(", ")}`);
  }
}

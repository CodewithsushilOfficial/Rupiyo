import { z } from 'zod';

const envSchema = z.object({
  NEXT_PUBLIC_APP_URL: z.string().url().default('http://localhost:3000'),

  // Supabase Environment Variables
  NEXT_PUBLIC_SUPABASE_URL: z.string().url().optional(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1).optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1).optional(),

  // NVIDIA NIM AI Configuration
  AI_PROVIDER: z.string().default('nvidia_nim'),
  NVIDIA_NIM_API_KEY: z.string().optional(),
  NVIDIA_NIM_BASE_URL: z.string().url().default('https://integrate.api.nvidia.com/v1'),
  NVIDIA_NIM_MODEL: z.string().default('meta/llama-3.1-70b-instruct'),
  NVIDIA_NIM_TIMEOUT_MS: z.string().transform(Number).default('8000'),

  // Application Defaults
  NEXT_PUBLIC_DEFAULT_CURRENCY: z.string().default('INR'),
  NEXT_PUBLIC_DEFAULT_LOCALE: z.string().default('en-IN'),
});

export function validateEnv() {
  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    console.error('❌ Environment Variable Validation Errors:', result.error.flatten().fieldErrors);
    if (process.env.NODE_ENV === 'production') {
      throw new Error('Invalid environment configuration in production');
    }
  }

  return result.data || {};
}

export const env = validateEnv();

import { z } from "zod";

export const configSchema = z.object({
  apiKey: z.string().min(1, "API key is required"),
  apiUrl: z.string().url().optional(),
  timeout: z.number().positive().optional(),
  maxRetries: z.number().positive().optional(),
});

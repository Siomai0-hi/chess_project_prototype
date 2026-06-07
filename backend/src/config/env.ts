import "dotenv/config";
import { z } from "zod";

const EnvSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().default(4000),
  DATABASE_URL: z
    .string()
    .default("postgresql://postgres:postgres@localhost:5432/mongolian_chess?schema=public"),
  JWT_SECRET: z.string().min(16).default("dev-secret-change-me-before-production"),
  JWT_EXPIRES_IN: z.string().default("7d"),
  OPENAI_API_KEY: z.string().optional(),
  OPENAI_MODEL: z.string().default("gpt-4.1-mini"),
  CORS_ORIGIN: z.string().default("http://localhost:5173").transform((val) => val.split(",").map((v) => v.trim())),
});

export const env = EnvSchema.parse(process.env);

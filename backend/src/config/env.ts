import "dotenv/config";
import { z } from "zod";

const DEFAULT_DATABASE_URL = "postgresql://postgres:postgres@localhost:5432/mongolian_chess?schema=public";
const DEFAULT_JWT_SECRET = "dev-secret-change-me-before-production";

const EnvSchema = z
  .object({
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
    PORT: z.coerce.number().int().min(1).max(65535).default(4000),
    DATABASE_URL: z.string().default(DEFAULT_DATABASE_URL),
    JWT_SECRET: z.string().min(16).default(DEFAULT_JWT_SECRET),
    JWT_EXPIRES_IN: z.string().default("7d"),
    OPENAI_API_KEY: z.string().optional(),
    OPENAI_MODEL: z.string().default("gpt-4.1-mini"),
    CORS_ORIGIN: z
      .string()
      .default("http://localhost:5173")
      .transform((val) => val.split(",").map((v) => v.trim()).filter(Boolean))
  })
  .superRefine((value, ctx) => {
    if (value.CORS_ORIGIN.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["CORS_ORIGIN"],
        message: "CORS_ORIGIN must include at least one origin"
      });
    }

    if (value.NODE_ENV !== "production") return;

    if (value.JWT_SECRET === DEFAULT_JWT_SECRET) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["JWT_SECRET"],
        message: "JWT_SECRET must be set to a non-default value in production"
      });
    }

    if (value.DATABASE_URL === DEFAULT_DATABASE_URL) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["DATABASE_URL"],
        message: "DATABASE_URL must be explicitly configured in production"
      });
    }
  });

export const env = EnvSchema.parse(process.env);

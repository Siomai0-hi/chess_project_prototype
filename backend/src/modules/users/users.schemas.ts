import { z } from "zod";

export const updateMeSchema = z.object({
  name: z.string().min(1).max(80).optional(),
  preferredLanguage: z.enum(["mn", "en"]).optional(),
  ratingEstimate: z.number().int().min(100).max(3500).optional()
});

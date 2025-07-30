import { z } from "zod";

export const updateProfileSchema = z
  .object({
    bio: z.string().max(500).optional().nullable(),
    profilePicture: z.string().url().optional().nullable(),
    socialLinks: z
      .object({
        X: z.string().url().optional().nullable(),
        linkedin: z.string().url().optional().nullable(),
        website: z.string().url().optional().nullable(),
      })
      .optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided",
  });

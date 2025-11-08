import { z } from "zod";

export const updateUserSchema = z.object({
  name: z.string().trim().min(1).max(255).optional(),
});

export type UpdateUserType = z.infer<typeof updateUserSchema>;

export const userIdSchema = z.string().trim().min(1);

export const bulkDeleteUserSchema = z.object({
  userIds: z
    .array(z.string().length(24, "Invalid user ID format"))
    .min(1, "At least one user ID must be provided"),
});

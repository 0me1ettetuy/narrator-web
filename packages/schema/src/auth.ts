import { z } from 'zod';

export const credentialsSchema = z.object({
  email: z.string().email().trim().toLowerCase(),
  password: z.string().min(8).max(128),
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(32),
});

export type CredentialsSchemaType = z.infer<typeof credentialsSchema>;
export type RefreshTokenSchemaType = z.infer<typeof refreshTokenSchema>;

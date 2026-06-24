import { z } from 'zod';

export const credentialsSchema = z.object({
  email: z.email().trim().toLowerCase(),
  password: z.string().min(8).max(128),
});

export type CredentialsSchemaType = z.infer<typeof credentialsSchema>;

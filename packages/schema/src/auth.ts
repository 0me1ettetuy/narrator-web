import { z } from 'zod';

export const credentialsSchema = z.object({
  email: z.email().trim().toLowerCase(),
  password: z.string().min(8).max(128),
});

export const registerSchema = credentialsSchema
  .extend({
    confirm: z.string().min(8).max(128),
  })
  .refine((data) => data.password === data.confirm, {
    path: ['confirm'],
    error: 'Passwords do not match.',
  });

export type CredentialsSchemaType = z.infer<typeof credentialsSchema>;
export type RegisterSchemaType = z.infer<typeof registerSchema>;

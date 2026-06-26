import { TRPCClientError } from '@trpc/client';

export const isUnauthorized = (error: unknown): boolean =>
  error instanceof TRPCClientError && error.data?.code === 'UNAUTHORIZED';

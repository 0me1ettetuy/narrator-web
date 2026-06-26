import { QueryClient } from '@tanstack/react-query';
import { TRPCClientError } from '@trpc/client';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (count, error) =>
        !(error instanceof TRPCClientError && error.data?.code === 'UNAUTHORIZED') && count < 3,
    },
  },
});

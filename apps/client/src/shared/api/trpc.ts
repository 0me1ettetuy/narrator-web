import { createTRPCOptionsProxy } from '@trpc/tanstack-react-query';
import { queryClient } from '@/shared/api/query-client';
import { createTRPCClient, httpBatchLink } from '@trpc/client';
import type { AppRouter } from '@narrator/server/api';

const url = import.meta.env.VITE_BACKEND_URL;

export const trpcClient = createTRPCClient<AppRouter>({
  links: [
    httpBatchLink({
      url,
      fetch: (input, init) => fetch(input, { ...init, credentials: 'include' }),
    }),
  ],
});

export const trpc = createTRPCOptionsProxy<AppRouter>({ client: trpcClient, queryClient });

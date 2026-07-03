import { createTRPCOptionsProxy } from '@trpc/tanstack-react-query';
import { queryClient } from '@/shared/api/query-client';
import { isUnauthorized } from '@/shared/api/is-unauthorized';
import { createTRPCClient, httpBatchLink, type TRPCClientError, type TRPCLink } from '@trpc/client';
import type { AppRouter } from '@narrator/server/api';
import { clearAccessToken, getAccessToken, setAccessToken } from '@/shared/auth';
import { observable } from '@trpc/server/observable';

const url = import.meta.env.VITE_BACKEND_URL;

const fetchWithCredentials: typeof fetch = (input, init) =>
  fetch(input, {
    ...init,
    credentials: 'include',
  });

const refreshClient = createTRPCClient<AppRouter>({
  links: [
    httpBatchLink({
      url,
      fetch: fetchWithCredentials,
    }),
  ],
});

let refreshPromise: ReturnType<typeof refreshClient.auth.refresh.mutate> | null = null;

const REFRESH_BLOCKLIST = new Set(['auth.login', 'auth.register', 'auth.refresh', 'auth.logout']);

const authLink: TRPCLink<AppRouter> = () => {
  return ({ next, op }) => {
    return observable((observer) => {
      let isActive = true;
      let retrySubscription: { unsubscribe: () => void } | undefined;

      const subscription = next(op).subscribe({
        next: (result) => observer.next(result),
        complete: () => observer.complete(),
        error: async (error: TRPCClientError<AppRouter>) => {
          const shouldRefresh =
            isUnauthorized(error) &&
            !op.context.authRefreshRetried &&
            !REFRESH_BLOCKLIST.has(op.path);

          if (!shouldRefresh) {
            observer.error(error);
            return;
          }

          try {
            refreshPromise ??= refreshClient.auth.refresh.mutate();
            const session = await refreshPromise;
            refreshPromise = null;

            if (!session) {
              throw new Error('Refresh did not return a session');
            }

            setAccessToken(session.accessToken);
            queryClient.setQueryData(trpc.auth.me.queryKey(), { user: session.user });

            if (!isActive) {
              return;
            }

            retrySubscription = next({
              ...op,
              context: {
                ...op.context,
                authRefreshRetried: true,
              },
            }).subscribe(observer);
          } catch {
            refreshPromise = null;
            clearAccessToken();

            const meQueryKey = trpc.auth.me.queryKey();

            if (op.path !== 'auth.me') {
              await queryClient.cancelQueries({ queryKey: meQueryKey });          
            }
            queryClient.setQueryData(meQueryKey, { user: null });

            if (isActive) {
              observer.error(error);
            }
          }
        },
      });

      return () => {
        isActive = false;
        subscription.unsubscribe();
        retrySubscription?.unsubscribe();
      };
    });
  };
};

export const trpcClient = createTRPCClient<AppRouter>({
  links: [
    authLink,
    httpBatchLink({
      url,
      fetch: fetchWithCredentials,
      headers() {
        const token = getAccessToken();
        return token ? { Authorization: `Bearer ${token}` } : {};
      },
    }),
  ],
});

export const trpc = createTRPCOptionsProxy<AppRouter>({ client: trpcClient, queryClient });

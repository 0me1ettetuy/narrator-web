import { trpc, trpcClient } from '@/shared/api/trpc';
import { useQuery, useMutation, queryOptions } from '@tanstack/react-query';
import { clearAccessToken } from '@/shared/auth/utils/access-token';
import { queryClient } from '@/shared/api/query-client';
import { isUnauthorized } from '@/shared/api/is-unauthorized';
import type { inferRouterOutputs } from '@trpc/server';
import type { AppRouter } from '@narrator/server/api';

export type AuthUser = inferRouterOutputs<AppRouter>['auth']['me']['user'];

export const useMe = () => useQuery(meQueryOptions());

export const meQueryOptions = () =>
  queryOptions({
    queryKey: trpc.auth.me.queryKey(),
    staleTime: 5 * 60 * 1000,
    queryFn: async (): Promise<{ user: AuthUser | null }> => {
      try {
        return await trpcClient.auth.me.query();
      } catch (error) {
        if (isUnauthorized(error)) {
          return { user: null };
        }
        throw error;
      }
    },
  });

export const useRegister = () => useMutation(trpc.auth.register.mutationOptions());

export const useLogin = () => useMutation(trpc.auth.login.mutationOptions());

export const useRefresh = () => useMutation(trpc.auth.refresh.mutationOptions());

export const useLogout = () =>
  useMutation(
    trpc.auth.logout.mutationOptions({
      onSettled: () => {
        clearAccessToken();
        queryClient.setQueryData(trpc.auth.me.queryKey(), { user: null });
      },
    }),
  );

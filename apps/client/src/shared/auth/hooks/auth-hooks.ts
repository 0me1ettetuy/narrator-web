import { trpc, trpcClient } from '@/shared/api/trpc';
import { useQuery, useMutation, queryOptions } from '@tanstack/react-query';
import { clearAccessToken, setAccessToken } from '@/shared/auth/utils/access-token';
import { queryClient } from '@/shared/api/query-client';
import { isUnauthorized } from '@/shared/api/is-unauthorized';
import type { inferRouterOutputs } from '@trpc/server';
import type { AppRouter } from '@narrator/server/api';

export type AuthUser = inferRouterOutputs<AppRouter>['auth']['me']['user'];

type MeQueryData = {
  user: AuthUser | null;
};

export const useMe = () => useQuery(meQueryOptions());

export const meQueryOptions = () =>
  queryOptions({
    queryKey: trpc.auth.me.queryKey(),
    staleTime: 5 * 60 * 1000,
    queryFn: async (): Promise<MeQueryData> => {
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

export const useLogin = () =>
  useMutation(
    trpc.auth.login.mutationOptions({
      onSuccess: (session) => {
        setAccessToken(session.accessToken);
        queryClient.setQueryData<MeQueryData>(trpc.auth.me.queryKey(), { user: session.user });
      },
    }),
  );

export const useRefresh = () => useMutation(trpc.auth.refresh.mutationOptions());

export const useLogout = () =>
  useMutation(
    trpc.auth.logout.mutationOptions({
      onSettled: () => {
        clearAccessToken();
        queryClient.setQueryData<MeQueryData>(trpc.auth.me.queryKey(), { user: null });
      },
    }),
  );

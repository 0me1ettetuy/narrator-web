import { clearAccessToken, setAccessToken } from '@/shared/auth/utils/access-token';
import { queryClient } from '@/shared/api/query-client';
import { isUnauthorized } from '@/shared/api/is-unauthorized';
import { trpc, trpcClient } from '@/shared/api/trpc';
import { queryOptions } from '@tanstack/react-query';
import type { inferRouterOutputs } from '@trpc/server';
import type { AppRouter } from '@narrator/server/api';

export type AuthUser = inferRouterOutputs<AppRouter>['auth']['me']['user'];
export type AuthSession = inferRouterOutputs<AppRouter>['auth']['login'];

type MeQueryData = {
  user: AuthUser | null;
};

const setAuthSession = (session: AuthSession) => {
  setAccessToken(session.accessToken);
  queryClient.setQueryData<MeQueryData>(trpc.auth.me.queryKey(), { user: session.user });
};

export const meQueryOptions = queryOptions({
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

export const loginMutationOptions = trpc.auth.login.mutationOptions({
  onSuccess: setAuthSession,
});

export const registerMutationOptions = trpc.auth.register.mutationOptions({
  onSuccess: setAuthSession,
});

export const refreshMutationOptions = trpc.auth.refresh.mutationOptions();

export const logoutMutationOptions = trpc.auth.logout.mutationOptions({
  onSettled: () => {
    clearAccessToken();
    queryClient.setQueryData<MeQueryData>(trpc.auth.me.queryKey(), { user: null });
  },
});

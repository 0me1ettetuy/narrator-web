import { trpc } from '@/shared/api/trpc';
import { useQuery, useMutation } from '@tanstack/react-query';
import { clearAccessToken } from '@/shared/auth/utils/access-token';
import { queryClient } from '@/shared/api/query-client';

export const useMe = () => useQuery(trpc.auth.me.queryOptions());

export const meQueryOptions = () => trpc.auth.me.queryOptions();

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

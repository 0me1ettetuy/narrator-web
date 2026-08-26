import { authClient } from '@/shared/lib/auth-client';
import { queryClient } from '@/shared/api/query-client';
import { queryOptions } from '@tanstack/react-query';

export const authSessionQueryKey = ['auth', 'session'] as const;

const getSessionQueryData = async () => {
  const { data } = await authClient.getSession();
  return { user: data?.user ?? null };
};

const refreshSessionQuery = async () => {
  const session = await getSessionQueryData();
  queryClient.setQueryData(authSessionQueryKey, session);
  return session;
};

export const meQueryOptions = queryOptions({
  queryKey: authSessionQueryKey,
  queryFn: getSessionQueryData,
});

export const login = async (input: { email: string; password: string }) => {
  const { error } = await authClient.signIn.email(input);
  if (error) throw new Error(error.message);
  await refreshSessionQuery();
};

export const register = async (input: { email: string; password: string }) => {
  const { error } = await authClient.signUp.email({
    email: input.email,
    password: input.password,
    name: input.email,
  });
  if (error) throw new Error(error.message);
  await refreshSessionQuery();
};

export const logout = async () => {
  const { error } = await authClient.signOut();
  if (error) throw new Error(error.message);
  queryClient.setQueryData(authSessionQueryKey, { user: null });
};

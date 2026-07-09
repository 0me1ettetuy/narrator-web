import { useQuery, useMutation } from '@tanstack/react-query';
import {
  meQueryOptions,
  loginMutationOptions,
  registerMutationOptions,
  refreshMutationOptions,
  logoutMutationOptions,
} from '../api/auth-options';

export const useMe = () => useQuery(meQueryOptions);

export const useRegister = () => useMutation(registerMutationOptions);

export const useLogin = () => useMutation(loginMutationOptions);

export const useRefresh = () => useMutation(refreshMutationOptions);

export const useLogout = () => useMutation(logoutMutationOptions);

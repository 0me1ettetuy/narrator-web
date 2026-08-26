import { useMutation, useQuery } from '@tanstack/react-query';
import { login, logout, meQueryOptions, register } from '../api/auth-options';

export const useMe = () => useQuery(meQueryOptions);
export const useLogin = () => useMutation({ mutationFn: login });
export const useRegister = () => useMutation({ mutationFn: register });
export const useLogout = () => useMutation({ mutationFn: logout });

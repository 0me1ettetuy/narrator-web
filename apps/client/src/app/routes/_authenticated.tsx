import { meQueryOptions } from '@/shared/auth/hooks/auth-hooks';
import { createFileRoute, redirect } from '@tanstack/react-router'
import { TRPCClientError } from '@trpc/client';
import { AuthenticatedLayout } from '@/pages/_authenticated/_layout';

export const Route = createFileRoute('/_authenticated')({
  beforeLoad: async ({context, location}) => {
    try {
      const me = await context.queryClient.ensureQueryData(meQueryOptions());

      if (!me.user) {
        throw redirect({
          to: '/login',
          search: {
            redirect: location.href,
          },
        });
      }
    } catch (error) {
      if (error instanceof TRPCClientError && error.data?.code === 'UNAUTHORIZED') {
        throw redirect({
          to: '/login',
          search: {
            redirect: location.href,
          },
        });
      } else {
        throw error;
      }
      
    }
  },
  component: AuthenticatedLayout,
})


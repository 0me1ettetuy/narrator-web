import { AuthorizedLayout } from '@/app/routing/AuthorizedLayout';
import { meQueryOptions } from '@/shared/auth/hooks/auth-hooks';
import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/_authorized')({
  beforeLoad: async ({context, location}) => {
    try {
      const me = await context.queryClient.ensureQueryData(meQueryOptions());

      if (!me.user) {
        throw redirect({
          to: '/auth/login',
          search: {
            redirect: location.href,
          },
        });
      }
    } catch {
      throw redirect({
        to: '/auth/login',
        search: {
          redirect: location.href,
        },
      });
    }
  },
  component: AuthorizedLayout,
})

import { createFileRoute, redirect } from '@tanstack/react-router';
import { AuthenticatedLayout } from '@/pages/_authenticated/_layout';

export const Route = createFileRoute('/_authenticated')({
  beforeLoad: async ({ context, location }) => {
    if (!context.auth.user) {
      throw redirect({
        to: '/login',
        search: {
          redirect: location.href,
        },
      });
    }
  },
  component: AuthenticatedLayout,
});

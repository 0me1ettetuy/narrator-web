import { LoginPage } from '@/pages/_public/login';
import { createFileRoute, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/_public/login')({
  validateSearch: (search: Record<string, unknown>): { redirect?: string } => ({
    redirect: typeof search.redirect === 'string' ? search.redirect : undefined,
  }),
  beforeLoad: ({ context }) => {
    if (context.auth.user) {
      throw redirect({
        to: '/home',
      });
    }
  },
  component: LoginPage,
});

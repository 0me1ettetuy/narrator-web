import { RegisterPage } from '@/pages/_public/register';
import { createFileRoute, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/_public/register')({
  beforeLoad: ({ context }) => {
    if (context.auth.user) {
      throw redirect({ to: '/home' });
    }
  },
  component: RegisterPage,
});

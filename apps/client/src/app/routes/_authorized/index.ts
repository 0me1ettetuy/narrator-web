import { createFileRoute, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/_authorized/')({
  beforeLoad: () => {
    throw redirect({
      to: '/home',
      replace: true,
    });
  },
});
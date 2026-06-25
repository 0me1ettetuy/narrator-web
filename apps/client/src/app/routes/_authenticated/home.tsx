import { createFileRoute } from '@tanstack/react-router';
import { HomePage } from '@/pages/_authenticated/home';

export const Route = createFileRoute('/_authenticated/home')({
  component: HomePage,
});

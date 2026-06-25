import { HeroPage } from '@/pages/_public/hero';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_public/hero')({
  component: HeroPage,
});

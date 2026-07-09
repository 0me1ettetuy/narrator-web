import { createRootRouteWithContext, Outlet } from '@tanstack/react-router';
import type { QueryClient } from '@tanstack/react-query';
import { Toaster } from '@/shared/components/ui/sonner';
import { NotFoundPage } from '@/pages/not-found';
import { meQueryOptions } from '@/shared/auth/api/auth-options';
import { ErrorPage } from '@/pages/error';

interface RouterContext {
  queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<RouterContext>()({
  beforeLoad: async ({ context }) => {
    const { user } = await context.queryClient.ensureQueryData(meQueryOptions);
    return { auth: { user } };
  },
  component: () => (
    <>
      <Outlet />
      <Toaster />
    </>
  ),
  notFoundComponent: NotFoundPage,
  errorComponent: ErrorPage,
});

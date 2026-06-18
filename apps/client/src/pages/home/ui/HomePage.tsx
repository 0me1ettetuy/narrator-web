import { useQuery } from '@tanstack/react-query';
import { trpc } from '@/shared/api/trpc';

export function HomePage() {
  const health = useQuery(trpc.health.message.queryOptions());

  return <div>{health.data?.message ?? 'Loading...'}</div>;
}

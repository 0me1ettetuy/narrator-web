import { QueryClientProvider } from '@tanstack/react-query';
import { HomePage } from '@/pages/home';
import { queryClient } from '@/shared/api/query-client';

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <HomePage />
    </QueryClientProvider>
  );
}

import { Outlet } from '@tanstack/react-router';
import { Header } from '@/widgets/header';

export function AuthenticatedLayout() {
  return (
    <div className="flex flex-col min-h-screen overflow-auto">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}

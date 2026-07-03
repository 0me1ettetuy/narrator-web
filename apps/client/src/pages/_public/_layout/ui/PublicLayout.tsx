import { Header } from '@/widgets/header';
import { Outlet } from '@tanstack/react-router';

export function PublicLayout() {
  return (
    <div className="flex flex-col min-h-screen overflow-auto">
      <Header />
      <main className="flex-1 flex flex-col">
        <Outlet />
      </main>
    </div>
  );
}

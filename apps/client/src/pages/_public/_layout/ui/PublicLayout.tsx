import { Header } from "@/widgets/header";
import { Outlet } from "@tanstack/react-router";

export function PublicLayout() {
  return (
    <div className="flex flex-col">
      <Header />
      <main className="flex-1"><Outlet /></main>
    </div>
  );
};
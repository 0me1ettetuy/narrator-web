import { Outlet, useNavigate } from '@tanstack/react-router';
import { useEffect } from 'react';
import { useMe } from '@/shared/auth/hooks/auth-hooks';
import { Header } from '@/widgets/header';

export function AuthenticatedLayout() {
  const navigate = useNavigate();
  const me = useMe();

  useEffect(() => {
    if (me.isSuccess && !me.data.user) {
      navigate({
        to: '/login',
        replace: true,
      });
    }
  }, [me.isSuccess, me.data, navigate]);

  return (<div className='flex flex-col'>
  <Header />
  <main className='flex-1'><Outlet /></main>
  </div>);
}
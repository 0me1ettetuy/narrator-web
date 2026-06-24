import { Outlet, useNavigate } from '@tanstack/react-router';
import { useEffect } from 'react';
import { useMe } from '@/shared/auth/hooks/auth-hooks';

export function AuthorizedLayout() {
  const navigate = useNavigate();
  const me = useMe();

  useEffect(() => {
    if (me.isSuccess && !me.data.user) {
      navigate({
        to: '/auth/login',
        replace: true,
      });
    }
  }, [me.isSuccess, me.data, navigate]);

  return <Outlet />;
}

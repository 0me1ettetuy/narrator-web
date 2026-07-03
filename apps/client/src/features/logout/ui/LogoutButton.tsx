import { useLogout } from '@/shared/auth/hooks/auth-hooks';
import { Button } from '@/shared/components/ui/button';
import { useNavigate } from '@tanstack/react-router';
import { toast } from 'sonner';

export function LogoutButton() {
  const logout = useLogout();
  const navigate = useNavigate();

  return (
    <Button
      variant="outline"
      size="lg"
      disabled={logout.isPending}
      onClick={async () => {
        try {
          await logout.mutateAsync();
        } finally {
          await navigate({ to: '/login' });
          toast('Log out successful!', {
            position: 'bottom-center',
          });
        }
      }}
    >
      {logout.isPending ? 'Logging out...' : 'Logout'}
    </Button>
  );
}

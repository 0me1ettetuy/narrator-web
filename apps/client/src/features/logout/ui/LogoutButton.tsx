import { useLogout } from '@/shared/auth/hooks/auth-hooks';
import { Button } from '@/shared/components/ui/button';
import { useNavigate, useRouter } from '@tanstack/react-router';
import { toast } from 'sonner';

export function LogoutButton() {
  const logout = useLogout();
  const navigate = useNavigate();
  const router = useRouter();

  return (
    <Button
      variant="outline"
      size="lg"
      disabled={logout.isPending}
      onClick={async () => {
        try {
          await logout.mutateAsync();
          await router.invalidate();
          await navigate({ to: '/login' });
          toast('Log out successful!', {
            position: 'bottom-center',
          });
        } catch (error) {
          toast('Log out failed', {
            description: error instanceof Error ? error.message : 'Please try again.',
            position: 'bottom-center',
          });
        }
      }}
    >
      {logout.isPending ? 'Logging out...' : 'Logout'}
    </Button>
  );
}

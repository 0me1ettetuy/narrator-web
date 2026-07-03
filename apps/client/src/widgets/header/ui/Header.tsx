import { LogoutButton } from '@/features/logout';
import { useMe } from '@/shared/auth/hooks/auth-hooks';
import { Logo } from '@/shared/components/logo';
import { Button } from '@/shared/components/ui/button';
import { Link } from '@tanstack/react-router';

export function Header() {
  const me = useMe();

  return (
    <div className="sticky flex justify-between items-center p-4 h-16 border-b">
      <Logo />
      {me.data?.user ? (
        <LogoutButton />
      ) : (
        <div className="flex gap-2">
          <Button size="lg" variant="link" asChild>
            <Link to="/login">Login</Link>
          </Button>
          <Button size="lg" variant="link">
            <Link to="/register">Register</Link>
          </Button>
        </div>
      )}
    </div>
  );
}

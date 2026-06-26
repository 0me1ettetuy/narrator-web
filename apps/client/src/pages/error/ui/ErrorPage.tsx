import type { ErrorComponentProps } from '@tanstack/react-router';

export function ErrorPage({ error }: ErrorComponentProps) {
  return (
    <div className="grid h-dvh place-items-center p-4 text-center">
      <div>
        <p className="font-medium">Something went wrong.</p>
        <p className="text-sm text-muted-foreground">{error.message}</p>
      </div>
    </div>
  );
}

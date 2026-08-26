import { standardSchemaResolver } from '@hookform/resolvers/standard-schema';
import { Controller, useForm } from 'react-hook-form';
import { credentialsSchema, type CredentialsSchemaType } from '@narrator/schema';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { toast } from 'sonner';
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/shared/components/ui/field';
import { Input } from '@/shared/components/ui/input';
import { Separator } from '@/shared/components/ui/separator';
import { useLogin } from '@/shared/auth/hooks/auth-hooks';
import { useNavigate, useRouter } from '@tanstack/react-router';
import { Route } from '@/app/routes/_public/login';

const LoginFormSchema = credentialsSchema;
type LoginFormType = CredentialsSchemaType;

export function LoginPage() {
  const form = useForm<LoginFormType>({
    resolver: standardSchemaResolver(LoginFormSchema),
    mode: 'onSubmit',
    defaultValues: {
      email: '',
      password: '',
    },
  });
  const login = useLogin();
  const navigate = useNavigate();
  const router = useRouter();
  const { redirect } = Route.useSearch();

  const onSubmit = async (data: LoginFormType) => {
    form.clearErrors('root');

    try {
      await login.mutateAsync(data);
      await router.invalidate();

      toast('Welcome sir!', {
        description: `Signed in as ${data.email}`,
        position: 'bottom-center',
      });

      await navigate({
        to: redirect ?? '/home',
      });
    } catch (error) {
      form.setError('root', {
        type: 'server',
        message: error instanceof Error ? error.message : 'Invalid email or password.',
      });
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-4 flex-1 flex justify-center items-center">
      <Card className="min-w-xl">
        <CardHeader>
          <CardTitle className="font-bold text-lg">Login</CardTitle>
          <CardDescription>Welcome, sir! Please introduse yourself.</CardDescription>
        </CardHeader>
        <Separator />
        <CardContent>
          <form id="login-form" onSubmit={form.handleSubmit(onSubmit)}>
            <FieldGroup className="py-4">
              <Controller
                name="email"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="form-email">Email</FieldLabel>
                    <FieldDescription>Enter your email adress</FieldDescription>
                    <Input
                      {...field}
                      id="form-email"
                      aria-invalid={fieldState.invalid}
                      placeholder="email@email.com"
                      type="text"
                    />
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />
              <Controller
                name="password"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="form-password">Password</FieldLabel>
                    <FieldDescription>Enter your password</FieldDescription>
                    <Input
                      {...field}
                      id="form-password"
                      aria-invalid={fieldState.invalid}
                      autoComplete="off"
                      placeholder="* * * * * *"
                      type="password"
                    />
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              ></Controller>
              {form.formState.errors.root && (
                <Field data-invalid>
                  <FieldError>{form.formState.errors.root.message}</FieldError>
                </Field>
              )}
            </FieldGroup>
          </form>
        </CardContent>
        <CardFooter>
          <Field orientation="horizontal">
            <Button
              onClick={() => form.reset()}
              type="button"
              variant="outline"
              size="lg"
              className="flex-1"
            >
              Reset
            </Button>
            <Button
              form="login-form"
              type="submit"
              size="lg"
              className="flex-2"
              disabled={login.isPending}
            >
              {login.isPending ? 'Logging in...' : 'Login'}
            </Button>
          </Field>
        </CardFooter>
      </Card>
    </div>
  );
}

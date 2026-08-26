import { useRegister } from '@/shared/auth/hooks/auth-hooks';
import { Button } from '@/shared/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/shared/components/ui/field';
import { Input } from '@/shared/components/ui/input';
import { Separator } from '@/shared/components/ui/separator';
import { standardSchemaResolver } from '@hookform/resolvers/standard-schema';
import { registerSchema, type RegisterSchemaType } from '@narrator/schema';
import { useNavigate, useRouter } from '@tanstack/react-router';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';

type RegisterFormType = RegisterSchemaType;
const RegisterFormSchema = registerSchema;

export function RegisterPage() {
  const form = useForm<RegisterFormType>({
    resolver: standardSchemaResolver(RegisterFormSchema),
    mode: 'onSubmit',
    defaultValues: {
      email: '',
      password: '',
      confirm: '',
    },
  });
  const navigate = useNavigate();
  const router = useRouter();
  const register = useRegister();

  const onSubmit = async (data: RegisterFormType) => {
    form.clearErrors('root');
    try {
      await register.mutateAsync({ email: data.email, password: data.password });
      await router.invalidate();
      toast('Registration successful!', {
        position: 'bottom-center',
        description: `You registered as ${data.email}`,
      });
      await navigate({
        to: '/home',
      });
    } catch (error) {
      form.setError('root', {
        type: 'server',
        message: error instanceof Error ? error.message : 'Invalid email.',
      });
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-4 flex-1 flex justify-center items-center">
      <Card className="min-w-xl">
        <CardHeader>
          <CardTitle className="font-bold text-lg">Register</CardTitle>
          <CardDescription>Please register with your email.</CardDescription>
        </CardHeader>
        <Separator />
        <CardContent>
          <form id="register-form" onSubmit={form.handleSubmit(onSubmit)}>
            <FieldGroup className="py-4">
              <Controller
                name="email"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="email">Email</FieldLabel>
                    <FieldDescription>Enter your email adress</FieldDescription>
                    <Input
                      {...field}
                      id="email"
                      aria-invalid={fieldState.invalid}
                      placeholder="email@example.com"
                      type="email"
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
                    <FieldLabel htmlFor="password">Password</FieldLabel>
                    <FieldDescription>Create password</FieldDescription>
                    <Input
                      {...field}
                      id="password"
                      aria-invalid={fieldState.invalid}
                      placeholder="* * * * *"
                      type="password"
                    />
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />
              <Controller
                name="confirm"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="confirm">Confirm Password</FieldLabel>
                    <FieldDescription>Repeat password</FieldDescription>
                    <Input
                      {...field}
                      id="confirm"
                      aria-invalid={fieldState.invalid}
                      placeholder="* * * * *"
                      type="password"
                    />
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />
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
              form="register-form"
              type="submit"
              size="lg"
              className="flex-2"
              disabled={register.isPending}
            >
              {register.isPending ? 'Registering...' : 'Register'}
            </Button>
          </Field>
        </CardFooter>
      </Card>
    </div>
  );
}

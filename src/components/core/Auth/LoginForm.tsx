import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';

import { FormTextField } from '@/components/FormTextField';
import { PrimaryButton } from '@/components/PrimaryButton';
import { useLogin } from '@/hooks/use-auth-query';
import { resolveRedirectPath } from '@/lib/safeRedirect';
import { loginSchema, type LoginPayload } from '@/zod-validations/auth.validation';

function LoginForm() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { mutate: submitLogin, isPending } = useLogin();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginPayload>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = (values: LoginPayload) => {
    submitLogin(values, {
      onSuccess: () => {
        // `from` is set by the axios interceptor when a session expires on a
        // protected page, so the user lands back where they were. Validated
        // because it comes from the query string.
        navigate(resolveRedirectPath(searchParams.get('from')));
      },
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mt-6 flex w-full flex-col gap-y-4">
      <FormTextField
        label="Email Address"
        type="email"
        required
        placeholder="Enter email address"
        autoComplete="email"
        error={errors.email?.message}
        {...register('email')}
      />

      <div>
        <FormTextField
          label="Password"
          type="password"
          required
          placeholder="Enter Password"
          autoComplete="current-password"
          error={errors.password?.message}
          {...register('password')}
        />
        <Link to="/forgot-password">
          <p className="caption text-status-info mt-1 ml-auto max-w-max">Forgot Password</p>
        </Link>
      </div>

      <PrimaryButton type="submit" isLoading={isPending} className="mt-6">
        Sign In
      </PrimaryButton>
    </form>
  );
}

export default LoginForm;

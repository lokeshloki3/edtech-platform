import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { BiArrowBack } from 'react-icons/bi';
import { Link, useLocation, useNavigate } from 'react-router-dom';

import { FormTextField } from '@/components/FormTextField';
import { PrimaryButton } from '@/components/PrimaryButton';
import { useResetPassword } from '@/hooks/use-auth-query';
import {
  resetPasswordFormSchema,
  type ResetPasswordFormPayload,
} from '@/zod-validations/auth.validation';

const UpdatePassword = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { mutate: submitResetPassword, isPending } = useResetPassword();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormPayload>({
    resolver: zodResolver(resetPasswordFormSchema),
    defaultValues: { password: '', confirmPassword: '' },
  });

  const onSubmit = (values: ResetPasswordFormPayload) => {
    // The reset token is the last path segment, e.g. /update-password/:token
    const token = location.pathname.split('/').at(-1) ?? '';

    submitResetPassword(
      { ...values, token },
      {
        onSuccess: () => navigate('/login'),
      }
    );
  };

  return (
    <div className="grid min-h-[calc(100vh-3.5rem)] place-items-center">
      {isPending ? (
        <div className="spinner" />
      ) : (
        <div className="max-w-[500px] p-4 lg:p-8">
          <h1 className="h6 text-global-text-primary">Choose new password</h1>
          <p className="body-1 text-global-text-secondary my-4">
            Almost done. Enter your new password and your are all set.
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-y-3">
            <FormTextField
              label="New Password"
              type="password"
              required
              placeholder="Enter Password"
              autoComplete="new-password"
              error={errors.password?.message}
              {...register('password')}
            />
            <FormTextField
              label="Confirm New Password"
              type="password"
              required
              placeholder="Confirm Password"
              autoComplete="new-password"
              error={errors.confirmPassword?.message}
              {...register('confirmPassword')}
            />

            <PrimaryButton type="submit" isLoading={isPending} className="mt-6">
              Reset Password
            </PrimaryButton>
          </form>

          <div className="mt-6 flex items-center justify-between">
            <Link to="/login">
              <p className="body-2 text-global-text-primary flex items-center gap-x-2">
                <BiArrowBack /> Back To Login
              </p>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default UpdatePassword;

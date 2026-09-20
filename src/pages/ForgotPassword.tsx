import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { BiArrowBack } from 'react-icons/bi';
import { Link } from 'react-router-dom';

import { FormTextField } from '@/components/FormTextField';
import { PrimaryButton } from '@/components/PrimaryButton';
import { useRequestPasswordResetToken } from '@/hooks/use-auth-query';
import {
  resetPasswordTokenSchema,
  type ResetPasswordTokenPayload,
} from '@/zod-validations/auth.validation';

const ForgotPassword = () => {
  const [emailSent, setEmailSent] = useState(false);
  const { mutate: requestResetToken, isPending } = useRequestPasswordResetToken();

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm<ResetPasswordTokenPayload>({
    resolver: zodResolver(resetPasswordTokenSchema),
    defaultValues: { email: '' },
  });

  const onSubmit = (values: ResetPasswordTokenPayload) => {
    requestResetToken(values, {
      onSuccess: () => setEmailSent(true),
    });
  };

  return (
    <div className="grid min-h-[calc(100vh-3.5rem)] place-items-center">
      {isPending ? (
        <div className="spinner" />
      ) : (
        <div className="max-w-[500px] p-4 lg:p-8">
          <h1 className="h6 text-global-text-primary">
            {!emailSent ? 'Reset your Password' : 'Check Email'}
          </h1>
          <p className="body-1 text-global-text-secondary my-4">
            {!emailSent
              ? "Have no fear. We'll email you instructions to reset your password. If you dont have access to your email we can try account recovery"
              : `We have sent the reset email to ${getValues('email')}`}
          </p>

          <form onSubmit={handleSubmit(onSubmit)}>
            {!emailSent && (
              <FormTextField
                label="Email Address"
                type="email"
                required
                placeholder="Enter email address"
                autoComplete="email"
                error={errors.email?.message}
                {...register('email')}
              />
            )}

            <PrimaryButton
              type="submit"
              label={!emailSent ? 'Submit' : 'Resend Email'}
              isLoading={isPending}
              className="mt-6"
            />
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

export default ForgotPassword;

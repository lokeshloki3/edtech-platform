import { useEffect, useState } from 'react';
import { BiArrowBack } from 'react-icons/bi';
import { RxCountdownTimer } from 'react-icons/rx';
import OtpInput from 'react-otp-input';
import { Link, useNavigate } from 'react-router-dom';

import { PrimaryButton } from '@/components/PrimaryButton';
import { useSendOtp, useSignup } from '@/hooks/use-auth-query';
import { useAuthStore } from '@/store/auth.store';

const VerifyEmail = () => {
  const navigate = useNavigate();
  const signupData = useAuthStore((s) => s.signupData);
  const [otp, setOtp] = useState('');

  const { mutate: submitSignup, isPending } = useSignup();
  const { mutate: resendOtp, isPending: isResending } = useSendOtp();

  useEffect(() => {
    // Only reachable once the signup form has been filled in.
    if (!signupData) {
      navigate('/signup', { replace: true });
    }
  }, [signupData, navigate]);

  if (!signupData) {
    return null;
  }

  const handleVerifyAndSignup = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    submitSignup(
      { ...signupData, otp },
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
          <h1 className="h6 text-global-text-primary">Verify Email</h1>
          <p className="body-1 text-global-text-secondary my-4">
            A verification code has been sent to you. Enter the code below
          </p>

          <form onSubmit={handleVerifyAndSignup}>
            <OtpInput
              value={otp}
              onChange={setOtp}
              numInputs={6}
              renderSeparator={<span>-</span>}
              renderInput={(props) => (
                <input
                  {...props}
                  placeholder="-"
                  className="bg-global-bg-surface text-global-text-primary focus:outline-global-highlight-text aspect-square w-[48px] rounded-lg border-0 text-center focus:border-0 focus:outline-2 lg:w-[60px]"
                />
              )}
              containerStyle={{
                justifyContent: 'space-between',
                gap: '0 6px',
              }}
            />

            <PrimaryButton
              type="submit"
              label="Verify Email"
              disabled={otp.length !== 6}
              className="mt-6"
            />
          </form>

          <div className="mt-6 flex items-center justify-between">
            <Link to="/signup">
              <p className="body-2 text-global-text-primary flex items-center gap-x-2">
                <BiArrowBack /> Back To Signup
              </p>
            </Link>
            <button
              type="button"
              disabled={isResending}
              className="body-2 flex cursor-pointer items-center gap-x-2 text-status-info disabled:cursor-not-allowed disabled:opacity-60"
              onClick={() => resendOtp({ email: signupData.email })}
            >
              <RxCountdownTimer />
              Resend it
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default VerifyEmail;

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';

import { FormTextField } from '@/components/FormTextField';
import { PrimaryButton } from '@/components/PrimaryButton';
import { useSendOtp } from '@/hooks/use-auth-query';
import { useAuthStore } from '@/store/auth.store';
import { signupFormSchema, type SignupFormPayload } from '@/zod-validations/auth.validation';
import Tab from '../../common/Tab';

// From the zod enum, not utils/constants.js, which is untyped JS and
// widens these to string.
type AccountTypeOption = SignupFormPayload['accountType'];

const TAB_DATA: { id: number; tabName: string; type: AccountTypeOption }[] = [
  { id: 1, tabName: 'Student', type: 'Student' },
  { id: 2, tabName: 'Instructor', type: 'Instructor' },
];

function SignupForm() {
  const navigate = useNavigate();
  const setSignupData = useAuthStore((s) => s.setSignupData);
  const { mutate: requestOtp, isPending } = useSendOtp();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<SignupFormPayload>({
    resolver: zodResolver(signupFormSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
      accountType: 'Student',
    },
  });

  const accountType = watch('accountType');

  const onSubmit = (values: SignupFormPayload) => {
    requestOtp(
      { email: values.email },
      {
        onSuccess: () => {
          setSignupData(values);
          navigate('/verify-email');
        },
      }
    );
  };

  return (
    <div>
      <Tab
        tabData={TAB_DATA}
        field={accountType}
        setField={(type: AccountTypeOption) => setValue('accountType', type)}
      />

      <form onSubmit={handleSubmit(onSubmit)} className="flex w-full flex-col gap-y-4">
        <div className="flex gap-x-4">
          <FormTextField
            label="First Name"
            required
            placeholder="Enter first name"
            autoComplete="given-name"
            error={errors.firstName?.message}
            {...register('firstName')}
          />
          <FormTextField
            label="Last Name"
            required
            placeholder="Enter last name"
            autoComplete="family-name"
            error={errors.lastName?.message}
            {...register('lastName')}
          />
        </div>

        <FormTextField
          label="Email Address"
          type="email"
          required
          placeholder="Enter email address"
          autoComplete="email"
          error={errors.email?.message}
          {...register('email')}
        />

        <div className="flex gap-x-4">
          <FormTextField
            label="Create Password"
            type="password"
            required
            placeholder="Enter Password"
            autoComplete="new-password"
            error={errors.password?.message}
            {...register('password')}
          />
          <FormTextField
            label="Confirm Password"
            type="password"
            required
            placeholder="Confirm Password"
            autoComplete="new-password"
            error={errors.confirmPassword?.message}
            {...register('confirmPassword')}
          />
        </div>

        <PrimaryButton
          type="submit"
          label="Create Account"
          isLoading={isPending}
          className="mt-6"
        />
      </form>
    </div>
  );
}

export default SignupForm;

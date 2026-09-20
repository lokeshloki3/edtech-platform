import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';

import { FormTextField } from '@/components/FormTextField';
import { useChangePassword } from '@/hooks/use-profile-query';
import {
  changePasswordSchema,
  type ChangePasswordPayload,
} from '@/zod-validations/settings.validation';
import IconBtn from '../../../common/IconBtn';

const UpdatePassword = () => {
  const navigate = useNavigate();
  const { mutate: submitChangePassword, isPending } = useChangePassword();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ChangePasswordPayload>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { oldPassword: '', newPassword: '', confirmNewPassword: '' },
  });

  const onSubmit = (values: ChangePasswordPayload) => {
    submitChangePassword(values, { onSuccess: () => reset() });
  };

  return (
    <div>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="border-global-stroke-primary bg-global-bg-surface my-10 flex flex-col gap-y-6 rounded-md border-[1px] p-8 px-12">
          <h2 className="text-global-text-primary text-lg font-semibold">Password</h2>

          <div className="flex flex-col gap-5 lg:flex-row">
            <div className="lg:w-[48%]">
              <FormTextField
                label="Current Password"
                type="password"
                required
                placeholder="Enter Current Password"
                autoComplete="current-password"
                error={errors.oldPassword?.message}
                {...register('oldPassword')}
              />
            </div>
            <div className="lg:w-[48%]">
              <FormTextField
                label="New Password"
                type="password"
                required
                placeholder="Enter New Password"
                autoComplete="new-password"
                error={errors.newPassword?.message}
                {...register('newPassword')}
              />
            </div>
          </div>

          <div className="flex flex-col gap-5 lg:flex-row">
            <div className="lg:w-[48%]">
              <FormTextField
                label="Confirm New Password"
                type="password"
                required
                placeholder="Confirm New Password"
                autoComplete="new-password"
                error={errors.confirmNewPassword?.message}
                {...register('confirmNewPassword')}
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={() => navigate('/dashboard/my-profile')}
            className="bg-global-card-surface-2 text-global-text-secondary cursor-pointer rounded-md px-5 py-2 font-semibold"
          >
            Cancel
          </button>
          <IconBtn type="submit" text={isPending ? 'Updating...' : 'Update'} disabled={isPending} />
        </div>
      </form>
    </div>
  );
};

export default UpdatePassword;

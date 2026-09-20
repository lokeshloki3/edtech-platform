import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';

import { useUpdateProfile } from '@/hooks/use-profile-query';
import { useAuthStore } from '@/store/auth.store';
import {
  updateProfileSchema,
  type UpdateProfilePayload,
} from '@/zod-validations/settings.validation';
import IconBtn from '../../../common/IconBtn';

const genders = ['Male', 'Female', 'Non-Binary', 'Prefer not to say', 'Other'];

const EditProfile = () => {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const { mutate: saveProfile, isPending } = useUpdateProfile();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UpdateProfilePayload>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      firstName: user?.firstName ?? '',
      lastName: user?.lastName ?? '',
      dateOfBirth: user?.additionalDetails?.dateOfBirth ?? '',
      gender: user?.additionalDetails?.gender ?? genders[0],
      contactNumber: user?.additionalDetails?.contactNumber
        ? String(user.additionalDetails.contactNumber)
        : '',
      about: user?.additionalDetails?.about ?? '',
    },
  });

  const onSubmit = (values: UpdateProfilePayload) => saveProfile(values);

  return (
    <div>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="border-global-stroke-primary bg-global-bg-surface my-10 flex flex-col gap-y-6 rounded-md border-[1px] p-8 px-12">
          <h2 className="text-global-text-primary text-lg font-semibold">Profile Information</h2>

          <div className="flex flex-col gap-5 lg:flex-row">
            <div className="flex flex-col gap-2 lg:w-[48%]">
              <label htmlFor="firstName" className="label-style">
                First Name
              </label>
              <input
                type="text"
                id="firstName"
                placeholder="Enter first name"
                className="form-style"
                {...register('firstName')}
              />
              {errors.firstName && (
                <span className="text-status-error -mt-1 text-[12px]">
                  {errors.firstName.message}
                </span>
              )}
            </div>

            <div className="flex flex-col gap-2 lg:w-[48%]">
              <label htmlFor="lastName" className="label-style">
                Last Name
              </label>
              <input
                type="text"
                id="lastName"
                placeholder="Enter last name"
                className="form-style"
                {...register('lastName')}
              />
              {errors.lastName && (
                <span className="text-status-error -mt-1 text-[12px]">
                  {errors.lastName.message}
                </span>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-5 lg:flex-row">
            <div className="flex flex-col gap-2 lg:w-[48%]">
              <label htmlFor="dateOfBirth" className="label-style">
                Date of Birth
              </label>
              <input
                type="date"
                id="dateOfBirth"
                max={new Date().toISOString().split('T')[0]}
                className="form-style"
                {...register('dateOfBirth')}
              />
              {errors.dateOfBirth && (
                <span className="text-status-error -mt-1 text-[12px]">
                  {errors.dateOfBirth.message}
                </span>
              )}
            </div>

            <div className="flex flex-col gap-2 lg:w-[48%]">
              <label htmlFor="gender" className="label-style">
                Gender
              </label>
              <select id="gender" className="form-style" {...register('gender')}>
                {genders.map((gender) => (
                  <option key={gender} value={gender}>
                    {gender}
                  </option>
                ))}
              </select>
              {errors.gender && (
                <span className="text-status-error -mt-1 text-[12px]">{errors.gender.message}</span>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-5 lg:flex-row">
            <div className="flex flex-col gap-2 lg:w-[48%]">
              <label htmlFor="contactNumber" className="label-style">
                Contact Number
              </label>
              <input
                type="tel"
                id="contactNumber"
                placeholder="Enter Contact Number"
                className="form-style"
                {...register('contactNumber')}
              />
              {errors.contactNumber && (
                <span className="text-status-error -mt-1 text-[12px]">
                  {errors.contactNumber.message}
                </span>
              )}
            </div>

            <div className="flex flex-col gap-2 lg:w-[48%]">
              <label htmlFor="about" className="label-style">
                About
              </label>
              <input
                type="text"
                id="about"
                placeholder="Enter Bio Details"
                className="form-style"
                {...register('about')}
              />
              {errors.about && (
                <span className="text-status-error -mt-1 text-[12px]">{errors.about.message}</span>
              )}
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
          <IconBtn type="submit" text={isPending ? 'Saving...' : 'Save'} disabled={isPending} />
        </div>
      </form>
    </div>
  );
};

export default EditProfile;

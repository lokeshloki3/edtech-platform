import React from 'react';
import IconBtn from '../../common/IconBtn';
import { RiEditBoxLine } from 'react-icons/ri';
import { useNavigate } from 'react-router-dom';
import { formattedDate } from '../../../utils/dateFormatter';
import { useAuthStore } from '@/store/auth.store';

const MyProfile = () => {
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();

  return (
    <>
      <h1 className="text-global-text-primary mb-14 text-3xl font-medium">My Profile</h1>
      <div className="border-global-stroke-primary bg-global-bg-surface flex flex-col items-center justify-between rounded-md border-[1px] p-8 px-12 md:flex-row">
        <div className="flex items-center gap-x-4">
          <img
            src={user?.image}
            alt={`profile-${user?.firstName}`}
            className="aspect-square w-[78px] rounded-full object-cover"
          />
          <div className="space-y-1">
            <p className="text-global-text-primary text-lg font-semibold">
              {user?.firstName + ' ' + user?.lastName}
            </p>
            <p className="text-global-text-tertiary text-sm">{user?.email}</p>
          </div>
        </div>

        <div className="mt-4 flex w-full justify-end md:mt-0 md:w-auto">
          <IconBtn
            text="Edit"
            onclick={() => {
              navigate('/dashboard/settings');
            }}
          >
            <RiEditBoxLine />
          </IconBtn>
        </div>
      </div>

      <div className="border-global-stroke-primary bg-global-bg-surface my-10 flex flex-col gap-y-10 rounded-md border-[1px] p-8 px-12">
        <div className="flex w-full items-center justify-between">
          <p className="text-global-text-primary text-lg font-semibold">About</p>
          <IconBtn
            text="Edit"
            onclick={() => {
              navigate('/dashboard/settings');
            }}
          >
            <RiEditBoxLine />
          </IconBtn>
        </div>
        <p
          className={`${
            user?.additionalDetails?.about
              ? 'text-global-text-primary'
              : 'text-global-text-tertiary'
          } text-sm font-medium`}
        >
          {user?.additionalDetails?.about ?? 'Write Something About Yourself'}
        </p>
      </div>

      <div className="border-global-stroke-primary bg-global-bg-surface my-10 flex flex-col gap-y-10 rounded-md border-[1px] p-8 px-12">
        <div className="flex w-full items-center justify-between">
          <p className="text-global-text-primary text-lg font-semibold">Personal Details</p>
          <IconBtn
            text="Edit"
            onclick={() => {
              navigate('/dashboard/settings');
            }}
          >
            <RiEditBoxLine />
          </IconBtn>
        </div>
        <div className="flex max-w-[500px] flex-col justify-between md:flex-row">
          <div className="flex flex-col gap-y-5">
            <div>
              <p className="text-global-text-disabled mb-2 text-sm">First Name</p>
              <p className="text-global-text-primary text-sm font-medium">{user?.firstName}</p>
            </div>
            <div>
              <p className="text-global-text-disabled mb-2 text-sm">Email</p>
              <p className="text-global-text-primary text-sm font-medium">{user?.email}</p>
            </div>
            <div>
              <p className="text-global-text-disabled mb-2 text-sm">Gender</p>
              <p className="text-global-text-primary text-sm font-medium">
                {user?.additionalDetails?.gender ?? 'Add Gender'}
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-y-5">
            <div>
              <p className="text-global-text-disabled mb-2 text-sm">Last Name</p>
              <p className="text-global-text-primary text-sm font-medium">{user?.lastName}</p>
            </div>
            <div>
              <p className="text-global-text-disabled mb-2 text-sm">Phone Number</p>
              <p className="text-global-text-primary text-sm font-medium">
                {user?.additionalDetails?.contactNumber ?? 'Add Contact Number'}
              </p>
            </div>
            <div>
              <p className="text-global-text-disabled mb-2 text-sm">Date Of Birth</p>
              <p className="text-global-text-primary text-sm font-medium">
                {formattedDate(user?.additionalDetails?.dateOfBirth) ?? 'Add Date Of Birth'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default MyProfile;

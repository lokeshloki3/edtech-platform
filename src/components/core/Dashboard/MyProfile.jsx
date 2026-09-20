import React from 'react'
import IconBtn from '../../common/IconBtn';
import { RiEditBoxLine } from 'react-icons/ri';
import { useNavigate } from 'react-router-dom';
import { formattedDate } from "../../../utils/dateFormatter"
import { useAuthStore } from '@/store/auth.store';

const MyProfile = () => {
    const user = useAuthStore((s) => s.user);
    const navigate = useNavigate();

    return (
        <>
            <h1 className='mb-14 text-3xl font-medium text-global-text-primary'>
                My Profile
            </h1>
            <div className="flex items-center justify-between rounded-md border-[1px] border-global-stroke-primary bg-global-bg-surface p-8 px-12 flex-col md:flex-row">
                <div className="flex items-center gap-x-4">
                    <img
                        src={user?.image}
                        alt={`profile-${user?.firstName}`}
                        className="aspect-square w-[78px] rounded-full object-cover"
                    />
                    <div className='space-y-1'>
                        <p className='text-lg font-semibold text-global-text-primary'>
                            {user?.firstName + " " + user?.lastName}
                        </p>
                        <p className="text-sm text-global-text-tertiary">{user?.email}</p>
                    </div>
                </div>

                <div className="mt-4 w-full flex justify-end md:mt-0 md:w-auto">
                    <IconBtn
                        text="Edit"
                        onclick={() => {
                            navigate("/dashboard/settings")
                        }}
                    >
                        <RiEditBoxLine />
                    </IconBtn>
                </div>
            </div>

            <div className="my-10 flex flex-col gap-y-10 rounded-md border-[1px] border-global-stroke-primary bg-global-bg-surface p-8 px-12">
                <div className="flex w-full items-center justify-between">
                    <p className="text-lg font-semibold text-global-text-primary">About</p>
                    <IconBtn
                        text="Edit"
                        onclick={() => {
                            navigate("/dashboard/settings")
                        }}
                    >
                        <RiEditBoxLine />
                    </IconBtn>
                </div>
                <p
                    className={`${user?.additionalDetails?.about
                        ? "text-global-text-primary"
                        : "text-global-text-tertiary"
                        } text-sm font-medium`}
                >
                    {user?.additionalDetails?.about ?? "Write Something About Yourself"}
                </p>
            </div>

            <div className="my-10 flex flex-col gap-y-10 rounded-md border-[1px] border-global-stroke-primary bg-global-bg-surface p-8 px-12">
                <div className="flex w-full items-center justify-between">
                    <p className="text-lg font-semibold text-global-text-primary">
                        Personal Details
                    </p>
                    <IconBtn
                        text="Edit"
                        onclick={() => {
                            navigate("/dashboard/settings")
                        }}
                    >
                        <RiEditBoxLine />
                    </IconBtn>
                </div>
                <div className="flex flex-col md:flex-row max-w-[500px] justify-between">
                    <div className="flex flex-col gap-y-5">
                        <div>
                            <p className="mb-2 text-sm text-global-text-disabled">First Name</p>
                            <p className="text-sm font-medium text-global-text-primary">
                                {user?.firstName}
                            </p>
                        </div>
                        <div>
                            <p className="mb-2 text-sm text-global-text-disabled">Email</p>
                            <p className="text-sm font-medium text-global-text-primary">
                                {user?.email}
                            </p>
                        </div>
                        <div>
                            <p className="mb-2 text-sm text-global-text-disabled">Gender</p>
                            <p className="text-sm font-medium text-global-text-primary">
                                {user?.additionalDetails?.gender ?? "Add Gender"}
                            </p>
                        </div>
                    </div>
                    <div className="flex flex-col gap-y-5">
                        <div>
                            <p className="mb-2 text-sm text-global-text-disabled">Last Name</p>
                            <p className="text-sm font-medium text-global-text-primary">
                                {user?.lastName}
                            </p>
                        </div>
                        <div>
                            <p className="mb-2 text-sm text-global-text-disabled">Phone Number</p>
                            <p className="text-sm font-medium text-global-text-primary">
                                {user?.additionalDetails?.contactNumber ?? "Add Contact Number"}
                            </p>
                        </div>
                        <div>
                            <p className="mb-2 text-sm text-global-text-disabled">Date Of Birth</p>
                            <p className="text-sm font-medium text-global-text-primary">
                                {formattedDate(user?.additionalDetails?.dateOfBirth) ??
                                    "Add Date Of Birth"}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default MyProfile
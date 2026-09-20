import { useState } from 'react';
import { FiTrash2 } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

import { useDeleteProfile } from '@/hooks/use-profile-query';
import ConfirmationModal, { type ModalData } from '../../../common/ConfirmationModal';

const DeleteAccount = () => {
  const navigate = useNavigate();
  const [confirmationModal, setConfirmationModal] = useState<ModalData | null>(null);
  const { mutate: deleteAccount } = useDeleteProfile();

  const handleDeleteAccount = () => {
    deleteAccount(undefined, {
      onSuccess: () => navigate('/'),
    });
  };

  return (
    <div>
      <div className="border-status-error-stroke bg-status-error-surface my-10 flex flex-col gap-2 rounded-md border-[1px] p-8 px-12">
        <div className="flex items-center gap-3">
          <div className="bg-status-error-stroke flex aspect-square h-14 w-14 items-center justify-center rounded-full">
            <FiTrash2 className="text-status-error text-3xl" />
          </div>
          <h2 className="text-global-text-primary text-lg font-semibold">Delete Account</h2>
        </div>

        <div className="flex flex-col space-y-2">
          <div className="text-status-error w-full">
            <p>Would you like to delete account?</p>
            <p>
              This account may contain Paid Courses. Deleting your account is permanent and will
              remove all the contain associated with it. Account scheduled for deletion in 3 days.
              Log in before then to cancel.
            </p>
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              className="text-status-error w-fit cursor-pointer italic"
              onClick={() => {
                setConfirmationModal({
                  text1: 'Do you want to delete your account?',
                  text2: 'This action will permanently delete your account and all related data.',
                  btn1Text: 'Delete',
                  btn2Text: 'Cancel',
                  btn1Handler: handleDeleteAccount,
                  btn2Handler: () => setConfirmationModal(null),
                });
              }}
            >
              I want to delete my account.
            </button>
          </div>
        </div>
      </div>
      {confirmationModal && <ConfirmationModal modalData={confirmationModal} />}
    </div>
  );
};

export default DeleteAccount;

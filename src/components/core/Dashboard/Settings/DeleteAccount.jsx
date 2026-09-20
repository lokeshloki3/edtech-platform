import React, { useState } from 'react'
import { FiTrash2 } from 'react-icons/fi'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom';
import { deleteProfile } from '../../../../services/operations/settingsAPI';
import ConfirmationModal from '../../../common/ConfirmationModal';

const DeleteAccount = () => {

    const dispatch = useDispatch();
    const { token } = useSelector((state) => state.auth);
    const navigate = useNavigate();
    const [confirmationModal, setConfirmationModal] = useState(null);

    async function handleDeleteAccount() {
        try {
            dispatch(deleteProfile(token, navigate));
        } catch (error) {
            console.log("ERROR MESSAGE - ", error.message);
        }
    }

    return (
        <div>
            <div className='my-10 flex flex-col gap-2 rounded-md border-[1px] border-status-error-stroke bg-status-error-surface p-8 px-12'>
                <div className='flex items-center gap-3'>
                    <div className='flex aspect-square h-14 w-14 items-center justify-center rounded-full bg-status-error-stroke'>
                        <FiTrash2 className='text-3xl text-status-error' />
                    </div>
                    <h2 className='text-lg font-semibold text-global-text-primary'>
                        Delete Account
                    </h2>
                </div>

                <div className='flex flex-col space-y-2'>

                    <div className='w-full text-status-error'>
                        <p>Would you like to delete account?</p>
                        <p>
                            This account may contain Paid Courses. Deleting your account is
                            permanent and will remove all the contain associated with it.
                            Account scheduled for deletion in 3 days. Log in before then to cancel.
                        </p>
                    </div>

                    {/* <button
                        type='button'
                        className='w-fit cursor-pointer italic text-status-error'
                        onClick={handleDeleteAccount}
                    >
                        I want to delete my account.
                    </button> */}
                    <div className='flex justify-end'>
                        <button
                            type="button"
                            className="w-fit cursor-pointer italic text-status-error"
                            onClick={() => {
                                setConfirmationModal({
                                    text1: "Do you want to delete your account?",
                                    text2: "This action will permanently delete your account and all related data.",
                                    btn1Text: "Delete",
                                    btn2Text: "Cancel",
                                    btn1Handler: () => handleDeleteAccount(),
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
    )
}

export default DeleteAccount
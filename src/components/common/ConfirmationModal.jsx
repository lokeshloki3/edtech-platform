import React, { useEffect, useRef } from 'react'
import IconBtn from "./IconBtn"

const ConfirmationModal = ({ modalData }) => {
    const modalRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (modalRef.current && !modalRef.current.contains(event.target)) {
                modalData?.btn2Handler(); // close the modal
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [modalData]);

    return (
        <div className="fixed inset-0 z-[1000] !mt-0 grid place-items-center overflow-auto bg-white/10 backdrop-blur-sm">
            <div
                ref={modalRef}
                className="w-11/12 max-w-[350px] rounded-lg border border-global-stroke-tertiary bg-global-bg-surface p-6">
                <p className="text-2xl font-semibold text-global-text-primary">
                    {modalData?.text1}
                </p>
                <p className="mt-3 mb-5 leading-6 text-global-text-tertiary">
                    {modalData?.text2}
                </p>
                <div className="flex items-center gap-x-4">
                    <IconBtn
                        onclick={modalData?.btn1Handler}
                        text={modalData?.btn1Text}
                    />
                    <button
                        className="cursor-pointer rounded-md bg-button-tertiary-bg-default py-[8px] px-[20px] font-semibold text-global-text-inverse"
                        onClick={modalData?.btn2Handler}
                    >
                        {modalData?.btn2Text}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default ConfirmationModal
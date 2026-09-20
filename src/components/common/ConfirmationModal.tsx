import { useEffect, useRef } from 'react';

import IconBtn from './IconBtn';

export interface ModalData {
  text1: string;
  text2: string;
  btn1Text: string;
  btn2Text: string;
  btn1Handler: () => void;
  btn2Handler: () => void;
}

const ConfirmationModal = ({ modalData }: { modalData: ModalData }) => {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        modalData.btn2Handler();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [modalData]);

  return (
    <div className="fixed inset-0 z-[1000] !mt-0 grid place-items-center overflow-auto bg-white/10 backdrop-blur-sm">
      <div
        ref={modalRef}
        className="border-global-stroke-tertiary bg-global-bg-surface w-11/12 max-w-[350px] rounded-lg border p-6"
      >
        <p className="text-global-text-primary text-2xl font-semibold">{modalData.text1}</p>
        <p className="text-global-text-tertiary mt-3 mb-5 leading-6">{modalData.text2}</p>
        <div className="flex items-center gap-x-4">
          <IconBtn onclick={modalData.btn1Handler} text={modalData.btn1Text} />
          <button
            className="bg-button-tertiary-bg-default text-global-text-inverse cursor-pointer rounded-md px-[20px] py-[8px] font-semibold"
            onClick={modalData.btn2Handler}
          >
            {modalData.btn2Text}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;

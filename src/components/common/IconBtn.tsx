import type { ReactNode } from 'react';

interface IconBtnProps {
  text: ReactNode;
  onclick?: () => void;
  children?: ReactNode;
  disabled?: boolean;
  outline?: boolean;
  customClasses?: string;
  type?: 'button' | 'submit' | 'reset';
}

const IconBtn = ({
  text,
  onclick,
  children,
  disabled,
  outline = false,
  customClasses,
  type,
}: IconBtnProps) => {
  return (
    <button
      disabled={disabled}
      onClick={onclick}
      className={`flex items-center ${
        outline
          ? 'border-global-highlight-text border bg-transparent'
          : 'bg-button-primary-bg-default'
      } text-global-text-inverse cursor-pointer gap-x-2 rounded-md px-5 py-2 font-semibold ${customClasses ?? ''}`}
      type={type}
    >
      {children ? (
        <>
          <span className={outline ? 'text-global-highlight-text' : undefined}>{text}</span>
          {children}
        </>
      ) : (
        text
      )}
    </button>
  );
};

export default IconBtn;

import type { ButtonHTMLAttributes, ReactNode } from 'react';

import { cn } from '@/lib/utils';

interface PrimaryButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  isLoading?: boolean;
}

export function PrimaryButton({
  children,
  leftIcon,
  rightIcon,
  isLoading = false,
  disabled,
  className,
  ...props
}: PrimaryButtonProps) {
  // Derived rather than trusting the caller to pass both: a clickable pending
  // button is how you get duplicate submissions.
  const isDisabled = disabled || isLoading;

  return (
    <button
      {...props}
      disabled={isDisabled}
      className={cn(
        'button flex w-full items-center justify-center gap-x-2 rounded-lg px-3 py-3 transition-colors',
        isDisabled
          ? 'bg-button-primary-bg-disabled text-button-primary-content-disabled cursor-not-allowed'
          : 'bg-button-primary-bg-default text-button-primary-content-default hover:bg-button-primary-bg-hover hover:text-button-primary-content-hover active:bg-button-primary-bg-active active:text-button-primary-content-active cursor-pointer',
        className
      )}
    >
      {leftIcon}
      {isLoading ? 'Please wait…' : children}
      {rightIcon}
    </button>
  );
}

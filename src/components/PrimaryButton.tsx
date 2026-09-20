import type { ButtonHTMLAttributes, ReactNode } from 'react';

import { cn } from '@/lib/utils';

interface PrimaryButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  size?: 'lg' | 'sm';
  isLoading?: boolean;
}

export function PrimaryButton({
  label,
  leftIcon,
  rightIcon,
  size = 'lg',
  isLoading = false,
  disabled,
  className,
  ...props
}: PrimaryButtonProps) {
  const isDisabled = disabled || isLoading;

  return (
    <button
      {...props}
      disabled={isDisabled}
      className={cn(
        'button flex w-full items-center justify-center gap-x-2 rounded-lg transition-colors',
        size === 'lg' ? 'px-3 py-3' : 'px-3 py-2',
        isDisabled
          ? 'bg-button-primary-bg-disabled text-button-primary-content-disabled cursor-not-allowed'
          : 'bg-button-primary-bg-default text-button-primary-content-default hover:bg-button-primary-bg-hover hover:text-button-primary-content-hover active:bg-button-primary-bg-active active:text-button-primary-content-active cursor-pointer',
        className
      )}
    >
      {leftIcon}
      {isLoading ? 'Please wait…' : label}
      {rightIcon}
    </button>
  );
}

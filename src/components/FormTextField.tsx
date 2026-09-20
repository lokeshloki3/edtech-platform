import { useState, type InputHTMLAttributes } from 'react';
import { AiOutlineEye, AiOutlineEyeInvisible } from 'react-icons/ai';

import { cn } from '@/lib/utils';

interface FormTextFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: string;
  error?: string;
  required?: boolean;
  type?: 'text' | 'email' | 'password';
}

export function FormTextField({
  label,
  error,
  required = false,
  type = 'text',
  className,
  ...props
}: FormTextFieldProps) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';
  const resolvedType = isPassword && showPassword ? 'text' : type;

  return (
    <label className="relative flex w-full flex-col">
      <p className="label text-global-text-primary mb-1">
        {label} {required ? <sup className="text-input-field-error">*</sup> : null}
      </p>

      <input
        {...props}
        type={resolvedType}
        aria-invalid={!!error}
        className={cn(
          'body-2 bg-input-field-bg-default text-input-field-content-default w-full rounded-lg border p-3',
          'placeholder:text-input-field-placeholder-default',
          'hover:border-input-field-stroke-hover',
          'focus:border-input-field-stroke-active focus:outline-none',
          'disabled:bg-input-field-bg-disabled disabled:text-input-field-content-disabled disabled:cursor-not-allowed',
          isPassword && 'pr-12',
          error ? 'border-input-field-error' : 'border-input-field-stroke-default',
          className
        )}
      />

      {isPassword ? (
        <button
          type="button"
          aria-label={showPassword ? 'Hide password' : 'Show password'}
          onClick={() => setShowPassword((prev) => !prev)}
          className="text-icon-button-content-default hover:text-icon-button-content-hover absolute top-[38px] right-3 z-10 cursor-pointer"
        >
          {showPassword ? <AiOutlineEyeInvisible fontSize={24} /> : <AiOutlineEye fontSize={24} />}
        </button>
      ) : null}

      {error ? <span className="caption text-input-field-error mt-1">{error}</span> : null}
    </label>
  );
}

import { useId, useState, type InputHTMLAttributes } from 'react';
import { AiOutlineEye, AiOutlineEyeInvisible } from 'react-icons/ai';

import { cn } from '@/lib/utils';

interface FormTextFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  // Optional, so the field can also sit inside a layout that supplies its own
  // heading. The association is by htmlFor, not by wrapping.
  label?: string;
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
  id,
  ...props
}: FormTextFieldProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const errorId = `${inputId}-error`;

  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';
  const resolvedType = isPassword && showPassword ? 'text' : type;

  return (
    <div className="flex w-full flex-col">
      {label ? (
        <label htmlFor={inputId} className="label text-global-text-primary mb-1">
          {label} {required ? <sup className="text-input-field-error">*</sup> : null}
        </label>
      ) : null}

      {/* The toggle is positioned against the input, not the whole field, so it
          stays centred whether or not a label is rendered above it. */}
      <div className="relative">
        <input
          {...props}
          id={inputId}
          type={resolvedType}
          aria-invalid={!!error}
          aria-describedby={error ? errorId : undefined}
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
            className="text-icon-button-content-default hover:text-icon-button-content-hover absolute top-1/2 right-3 z-10 -translate-y-1/2 cursor-pointer"
          >
            {showPassword ? (
              <AiOutlineEyeInvisible fontSize={24} />
            ) : (
              <AiOutlineEye fontSize={24} />
            )}
          </button>
        ) : null}
      </div>

      {error ? (
        <span id={errorId} className="caption text-input-field-error mt-1">
          {error}
        </span>
      ) : null}
    </div>
  );
}

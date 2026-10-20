"use client";

import { useId, useState, type InputHTMLAttributes } from "react";

type PasswordInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & {
  wrapperClassName?: string;
};

function EyeIcon({ open }: { open: boolean }) {
  if (open) {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-4 w-4"
        aria-hidden="true"
      >
        <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    );
  }

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <path d="M3 3l18 18" />
      <path d="M10.6 10.6a2 2 0 0 0 2.8 2.8" />
      <path d="M9.4 5.5A10.4 10.4 0 0 1 12 5c6.5 0 10 7 10 7a18.5 18.5 0 0 1-2.2 3.2" />
      <path d="M6.1 6.1C3.8 7.8 2 12 2 12s3.5 7 10 7a9.8 9.8 0 0 0 4.3-1" />
    </svg>
  );
}

export function PasswordInput({
  className = "",
  wrapperClassName = "",
  disabled,
  id,
  ...props
}: PasswordInputProps) {
  const [visible, setVisible] = useState(false);
  const reactId = useId();
  const inputId = id ?? reactId;

  return (
    <div className={`relative ${wrapperClassName}`.trim()}>
      <input
        {...props}
        id={inputId}
        type={visible ? "text" : "password"}
        disabled={disabled}
        className={`${className} pr-10`.trim()}
      />
      <button
        type="button"
        tabIndex={-1}
        disabled={disabled}
        className="absolute inset-y-0 right-0 flex items-center px-3 text-[var(--ink-muted)] transition hover:text-[var(--ink)] disabled:pointer-events-none disabled:opacity-40"
        aria-label={visible ? "Hide password" : "Show password"}
        aria-pressed={visible}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setVisible((v) => !v);
        }}
      >
        <EyeIcon open={visible} />
      </button>
    </div>
  );
}

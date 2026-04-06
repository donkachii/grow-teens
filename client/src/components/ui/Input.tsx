"use client";

import { forwardRef, type InputHTMLAttributes } from "react";

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  hasError?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, hasError = false, ...props },
  ref
) {
  return (
    <input
      ref={ref}
      className={cn(
        "w-full rounded-lg border px-4 py-3 text-gray-900 outline-none transition placeholder:text-gray-400 disabled:cursor-not-allowed disabled:bg-gray-100",
        hasError
          ? "border-error-300 focus:border-error-400"
          : "border-gray-300 focus:border-primary",
        className
      )}
      {...props}
    />
  );
});

export default Input;

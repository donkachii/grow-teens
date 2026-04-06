"use client";

import { forwardRef, type SelectHTMLAttributes } from "react";

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export interface SelectProps
  extends SelectHTMLAttributes<HTMLSelectElement> {
  hasError?: boolean;
  placeholder?: string;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { className, hasError = false, children, ...props },
  ref
) {
  return (
    <select
      ref={ref}
      aria-label="Select"
      aria-required={props.required}
      aria-invalid={hasError}
      className={cn(
        "w-full appearance-none rounded-lg border bg-white px-4 py-3 text-gray-900 outline-none transition disabled:cursor-not-allowed disabled:bg-gray-100",
        hasError
          ? "border-error-300 focus:border-error-400"
          : "border-gray-300 focus:border-primary",
        className
      )}
      {...props}
    >
      {children}
    </select>
  );
});

export default Select;

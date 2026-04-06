"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";

interface ErrorMessageProps {
  error: string;
  onClose: () => void;
}

export default function ErrorMessage({ error, onClose }: ErrorMessageProps) {
  const [errorMessage, setErrorMessage] = useState<string | null | undefined>(
    error
  );

  useEffect(() => {
    if (error) {
      setErrorMessage(error);
    } else if (onClose) {
      onClose();
    }
  }, [error, onClose]);

  if (!errorMessage) return null;

  return (
    <div className="mb-5 flex items-start justify-between gap-3 rounded-xl border border-error-200 bg-error-50 px-4 py-3 text-error-700">
      <p className="text-sm leading-6">{errorMessage}</p>
      <button
        type="button"
        aria-label="Close error"
        onClick={() => {
          setErrorMessage(null);
          onClose();
        }}
        className="rounded-md p-1 transition-colors hover:bg-error-100"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

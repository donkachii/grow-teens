"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { FiEyeOff } from "react-icons/fi";
import { IoEyeOutline } from "react-icons/io5";

import { Button } from "@/components/ui/Button";
import ErrorMessage from "./ErrorMessage";

interface IFormInput {
  email: string;
  password: string;
}

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export default function LoginForm() {
  const [isVisible, setIsVisible] = useState(false);
  const searchParams = useSearchParams();
  const [errorMessage, setErrorMessage] = useState<string | null>(
    searchParams?.get("error") ?? null
  );
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    formState: { errors },
    handleSubmit,
  } = useForm<IFormInput>({
    mode: "onChange",
  });

  const onSubmit: SubmitHandler<IFormInput> = async (data) => {
    setIsLoading(true);

    const response = await signIn("credentials", {
      email: data.email,
      password: data.password,
      callbackUrl:
        searchParams.get("callbackUrl") || `${window.location.origin}/`,
      redirect: false,
    });

    setIsLoading(false);

    if (!response) {
      setErrorMessage("An unknown error occurred.");
      return;
    }

    if (response.error) {
      if (response.error === "Please verify your email before logging in") {
        const resendUrl = `/auth/resend-verification?email=${encodeURIComponent(
          data.email
        )}`;
        window.location.href = resendUrl;
        return;
      }

      setErrorMessage(response.error);
      return;
    }

    if (response.ok && response.url) {
      window.location.href = response.url;
      return;
    }

    setErrorMessage(response.error);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {errorMessage && (
        <ErrorMessage
          error={errorMessage}
          onClose={() => setErrorMessage(null)}
        />
      )}

      <div className="flex flex-col gap-5 text-gray-700">
        <div>
          <label
            htmlFor="email"
            className="mb-2 block text-sm font-medium text-gray-800"
          >
            Email <span className="text-error-500">*</span>
          </label>
          <input
            id="email"
            type="text"
            placeholder="Enter your business email"
            disabled={isLoading}
            className={cn(
              "w-full rounded-lg border px-4 py-3 outline-none transition",
              errors.email
                ? "border-error-300 focus:border-error-400"
                : "border-gray-300 focus:border-primary"
            )}
            {...register("email", {
              required: "Email is required",
              pattern: {
                value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                message: "Invalid email address",
              },
            })}
          />
          {errors.email && (
            <span className="mt-2 block text-sm text-error-500">
              {errors.email.message}
            </span>
          )}
        </div>

        <div>
          <label
            htmlFor="password"
            className="mb-2 block text-sm font-medium text-gray-800"
          >
            Password <span className="text-error-500">*</span>
          </label>
          <div className="relative">
            <input
              id="password"
              type={isVisible ? "text" : "password"}
              placeholder="Enter password"
              disabled={isLoading}
              className={cn(
                "w-full rounded-lg border px-4 py-3 pr-12 outline-none transition",
                errors.password
                  ? "border-error-300 focus:border-error-400"
                  : "border-gray-300 focus:border-primary"
              )}
              {...register("password", {
                required: true,
              })}
            />
            <button
              type="button"
              onClick={() => setIsVisible((prev) => !prev)}
              disabled={isLoading}
              aria-label={isVisible ? "Hide password" : "Show password"}
              className="absolute inset-y-0 right-3 flex items-center text-gray-500 transition-colors hover:text-gray-700"
            >
              {isVisible ? (
                <FiEyeOff className="h-4 w-4" />
              ) : (
                <IoEyeOutline className="h-4 w-4" />
              )}
            </button>
          </div>
          {errors.password && (
            <span className="mt-2 block text-sm text-error-500">
              Password is required
            </span>
          )}
        </div>

        <div className="flex items-center justify-between gap-4 text-sm">
          <label
            htmlFor="remember"
            className="flex items-center gap-2 text-gray-600"
          >
            <input
              type="checkbox"
              id="remember"
              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
            />
            <span>Remember Me</span>
          </label>
          <Link
            href="/auth/forgot-password"
            className="font-medium text-primary transition-colors hover:text-primary-600"
          >
            Forgot Password?
          </Link>
        </div>
      </div>

      <div className="my-6 flex flex-col gap-4">
        <Button type="submit" size="lg" fullWidth disabled={isLoading}>
          {isLoading ? "Submitting" : "Sign In"}
        </Button>
      </div>
    </form>
  );
}

/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Suspense, useState } from "react";
import { toast } from "react-toastify";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";

import { Button } from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { NextAuthUserSession } from "@/types";
import requestClient from "@/lib/requestClient";
import { handleServerErrorMessage } from "@/utils";

function ResendVerificationContent() {
  const searchParams = useSearchParams();
  const prefilledEmail = searchParams.get("email") ?? "";
  const justRegistered = searchParams.get("registered") === "true";

  const [email, setEmail] = useState(prefilledEmail);
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();
  const session = useSession();
  const sessionData = session.data as NextAuthUserSession;

  const handleResend = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      toast.error("Please enter your email address");
      return;
    }

    setIsLoading(true);

    try {
      const response = await requestClient({
        token: sessionData?.user?.token,
      }).post("/auth/resend-verification", { email });

      if (!response.data) {
        toast.error("Failed to resend verification");
      }

      toast.success(
        "Verification email sent successfully. Please check your inbox."
      );
    } catch (error: any) {
      toast.error(
        handleServerErrorMessage(error) ||
          "An error occurred while sending the verification email."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-[500px] rounded-2xl bg-white p-8 shadow-lg">
        <div className="space-y-4">
          <h1 className="text-center text-2xl font-semibold text-gray-900">
            {justRegistered ? "Check Your Email" : "Resend Verification Email"}
          </h1>

          {justRegistered && (
            <div className="rounded-xl border border-success-200 bg-success-50 px-4 py-3 text-sm text-success-700">
              Registration successful! A verification link has been sent to{" "}
              <strong>{prefilledEmail}</strong>. Please check your inbox.
            </div>
          )}

          <p className="text-gray-600">
            {justRegistered
              ? "Didn't receive the email? Click below to resend it."
              : "If your verification link has expired, enter your email below to receive a new one."}
          </p>

          <form onSubmit={handleResend} className="pt-2">
            <label
              htmlFor="resend-email"
              className="mb-2 block text-sm font-medium text-gray-800"
            >
              Email Address
            </label>
            <Input
              id="resend-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
            />

            <Button type="submit" fullWidth className="mt-6" disabled={isLoading}>
              {isLoading ? "Sending..." : "Send Verification Email"}
            </Button>
          </form>

          <Button
            variant="ghost"
            fullWidth
            onClick={() => router.push("/auth/signin")}
          >
            Back to Login
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function ResendVerification() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
          <div className="w-full max-w-[500px] rounded-2xl bg-white p-8 shadow-lg">
            <div className="space-y-4">
              <h1 className="text-center text-2xl font-semibold text-gray-900">
                Resend Verification Email
              </h1>
              <p className="text-center text-sm text-gray-500">Loading...</p>
            </div>
          </div>
        </div>
      }
    >
      <ResendVerificationContent />
    </Suspense>
  );
}

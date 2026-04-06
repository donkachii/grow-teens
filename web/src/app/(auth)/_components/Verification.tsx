"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FiAlertTriangle, FiCheck, FiX } from "react-icons/fi";

import { Button } from "@/components/ui/Button";
import requestClient from "@/lib/requestClient";

type VerificationStatus =
  | "loading"
  | "success"
  | "expired"
  | "invalid"
  | "error";

const statusConfig = {
  success: {
    title: "Email Verified!",
    description:
      "You can now log in to your account and continue your GrowTeens journey.",
    icon: FiCheck,
    iconClasses: "bg-success-100 text-success-600",
    buttonLabel: "Log In",
    buttonAction: "/auth/signin",
  },
  expired: {
    title: "Link Expired",
    description:
      "Your verification link has expired. Verification links are valid for 10 minutes.",
    icon: FiAlertTriangle,
    iconClasses: "bg-warning-100 text-warning-600",
    buttonLabel: "Request New Link",
    buttonAction: "/auth/resend-verification",
  },
  invalid: {
    title: "Verification Failed",
    description:
      "There was a problem verifying your email. Please try again or contact support.",
    icon: FiX,
    iconClasses: "bg-error-100 text-error-600",
    buttonLabel: "Try Again",
    buttonAction: "/auth/resend-verification",
  },
  error: {
    title: "Verification Failed",
    description:
      "There was a problem verifying your email. Please try again or contact support.",
    icon: FiX,
    iconClasses: "bg-error-100 text-error-600",
    buttonLabel: "Try Again",
    buttonAction: "/auth/resend-verification",
  },
} as const;

export default function Verification() {
  const [status, setStatus] = useState<VerificationStatus>("loading");
  const [email, setEmail] = useState("");
  const searchParams = useSearchParams();
  const router = useRouter();

  const token = searchParams?.get("token");

  const verify = useCallback(async () => {
    if (!token) {
      setStatus("invalid");
      return;
    }

    try {
      const response = await requestClient().get(`/auth/verify-email/${token}`);
      setStatus(response?.data?.status ?? "error");
      if (response?.data?.email) {
        setEmail(response.data.email);
      }
    } catch (error: any) {
      if (error.response?.data?.status) {
        setStatus(error.response.data.status);
      } else {
        setStatus("error");
      }
    }
  }, [token]);

  useEffect(() => {
    if (!token) {
      setStatus("invalid");
      return;
    }

    verify();
  }, [token, verify]);

  if (status === "loading") {
    return (
      <div className="mx-auto max-w-md px-4 py-10">
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white p-8 shadow-md">
          <div className="flex flex-col items-center gap-6 text-center">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary-100 border-t-primary" />
            <h1 className="text-2xl font-semibold text-gray-900">
              Verifying your email...
            </h1>
          </div>
        </div>
      </div>
    );
  }

  const currentStatus = statusConfig[status];
  const StatusIcon = currentStatus.icon;

  return (
    <div className="mx-auto max-w-md px-4 py-10">
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white p-8 shadow-md">
        <div className="flex flex-col items-center gap-6 text-center">
          <div
            className={`flex h-16 w-16 items-center justify-center rounded-full ${currentStatus.iconClasses}`}
          >
            <StatusIcon className="h-8 w-8" />
          </div>

          <div className="space-y-3">
            <h1 className="text-2xl font-semibold text-gray-900">
              {currentStatus.title}
            </h1>
            <p className="text-base leading-7 text-gray-600">
              {status === "success" && email
                ? `Your email ${email} has been successfully verified.`
                : currentStatus.description}
            </p>
          </div>

          <Button
            size="lg"
            fullWidth
            onClick={() => router.push(currentStatus.buttonAction)}
          >
            {currentStatus.buttonLabel}
          </Button>

          <p className="text-sm text-gray-500">
            Need help?{" "}
            <Link
              href="/contact"
              className="font-medium text-primary transition-colors hover:text-primary-600"
            >
              Contact support
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

"use client";

import { Suspense } from "react";
import Link from "next/link";

import AuthWrapper from "@/app/(auth)/_components/AuthWrapper";
import LoginForm from "@/app/(auth)/_components/LoginForm";

export default function LoginPage() {
  return (
    <AuthWrapper>
      <section className="mt-8 w-full sm:mx-auto sm:max-w-md">
        <article className="w-full rounded-3xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="mb-8 flex flex-col items-center text-center">
            <h1 className="mb-3 text-3xl font-semibold text-gray-900">
              Welcome Back
            </h1>
            <p className="text-base text-gray-500 md:text-lg">
              Please enter your details.
            </p>
          </div>

          <Suspense fallback={<div className="py-6 text-center text-sm text-gray-500">Loading...</div>}>
            <LoginForm />
          </Suspense>

          <div className="text-center">
            <p className="flex justify-center gap-1 text-base font-normal leading-6 text-gray-500">
              Don&apos;t have an account?
              <Link
                href="/auth/signup"
                className="font-medium text-primary transition-colors hover:text-primary-600"
              >
                Sign up
              </Link>
            </p>
          </div>
        </article>
      </section>
    </AuthWrapper>
  );
}

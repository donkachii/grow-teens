"use client";

import { Suspense } from "react";
import Link from "next/link";
import AuthWrapper from "@/app/(auth)/_components/AuthWrapper";
import SignupForm from "../../_components/SignupForm";

export default function RegisterPage() {
  return (
    <AuthWrapper>
      <section className="mt-8 w-full sm:mx-auto sm:max-w-md">
        <article className="w-full rounded-3xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="mb-8 flex flex-col items-center text-center">
            <h1 className="mb-3 text-3xl font-semibold text-gray-900">
              Welcome to GrowTeens
            </h1>
            <p className="text-base text-gray-500 md:text-lg">
              Create your account to get started.
            </p>
          </div>

          <Suspense
            fallback={
              <div className="py-6 text-center text-sm text-gray-500">
                Loading...
              </div>
            }
          >
            <SignupForm />
          </Suspense>

          <div className="text-center">
            <p className="flex justify-center gap-1 text-base font-normal leading-6 text-gray-500">
              Already have an account?
              <Link
                href="/auth/signin"
                className="font-medium text-primary transition-colors hover:text-primary-600"
              >
                Sign in
              </Link>
            </p>
          </div>
        </article>
      </section>
    </AuthWrapper>
  );
}

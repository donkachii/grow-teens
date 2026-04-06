"use client";

import Image from "next/image";

import logo from "@public/assets/images/logo.svg";
import { useRouter } from "next/navigation";

interface AuthWrapperProps {
  children: React.ReactNode;
}

export default function AuthWrapper({ children }: AuthWrapperProps) {
  const router = useRouter();
  return (
    <div className="flex min-h-dvh flex-col justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      {/* TODO: Add a side Image here to beautify the page */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <Image
            src={logo}
            alt="GrowTeens logo"
            className="h-auto w-[180px] cursor-pointer"
            priority
            onClick={() => router.push("/")}
          />
        </div>
      </div>
      {children}
    </div>
  );
}

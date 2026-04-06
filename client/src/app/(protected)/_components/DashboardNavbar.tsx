"use client";

import Image from "next/image";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { ChevronDownIcon } from "@heroicons/react/24/solid";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

import GreetingComponent from "./GreetingComponent";
import { NextAuthUserSession } from "@/types";
import logo from "../../../../public/assets/images/logo.svg";

function initials(firstName?: string, lastName?: string) {
  return `${firstName?.[0] ?? ""}${lastName?.[0] ?? ""}`.toUpperCase() || "GT";
}

const DashboardNavbar = () => {
  const router = useRouter();
  const session = useSession();
  const data = session.data as NextAuthUserSession;

  return (
    <header className="w-full bg-white shadow-sm lg:fixed lg:z-50">
      <div className="flex min-h-[98px] items-center justify-between gap-4 px-4 sm:px-6 lg:pr-8">
        <div className="flex items-center gap-6 md:gap-16">
          <div className="ml-12 hidden h-16 shrink-0 items-center md:ml-6 md:flex lg:ml-12">
            <Image
              src={logo}
              alt="GrowTeens"
              className="h-10 w-24 md:h-auto md:w-[160px]"
              width={160}
              height={66}
              priority
            />
          </div>
          <GreetingComponent />
        </div>

        <div className="flex items-center gap-x-4 lg:gap-x-6">
          <Menu as="div" className="relative">
            <MenuButton className="flex items-center rounded-xl p-1.5 transition-colors hover:bg-gray-50">
              <span className="sr-only">Open user menu</span>
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary-100 text-sm font-semibold text-primary">
                {initials(data?.user?.firstName, data?.user?.lastName)}
              </div>
              <span className="hidden lg:flex lg:items-center">
                <div className="ml-4 text-left">
                  <div className="flex gap-2">
                    <span
                      aria-hidden="true"
                      className="text-sm font-semibold leading-6 text-gray-900"
                    >
                      {data?.user?.firstName} {data?.user?.lastName}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">{data?.user?.role}</p>
                </div>
                <ChevronDownIcon
                  aria-hidden="true"
                  className="ml-4 h-5 w-5 text-gray-600"
                />
              </span>
            </MenuButton>
            <MenuItems className="absolute right-0 z-10 mt-2.5 w-40 origin-top-right rounded-xl bg-white p-2 shadow-lg ring-1 ring-gray-900/5 focus:outline-none">
              <MenuItem>
                {({ focus }) => (
                  <button
                    type="button"
                    onClick={() => {
                      if (data?.user?.role === "TEEN") {
                        router.push("/dashboard/settings/personal_information");
                      } else {
                        router.push("/");
                      }
                    }}
                    className={`w-full rounded-lg px-3 py-2 text-left text-sm ${
                      focus ? "bg-gray-100 text-gray-900" : "text-gray-700"
                    }`}
                  >
                    View Profile
                  </button>
                )}
              </MenuItem>
              <MenuItem>
                {({ focus }) => (
                  <button
                    type="button"
                    onClick={async () => {
                      await signOut({ redirect: false });
                      router.push("/");
                    }}
                    className={`w-full rounded-lg px-3 py-2 text-left text-sm ${
                      focus ? "bg-red-50 text-red-600" : "text-primary"
                    }`}
                  >
                    Log Out
                  </button>
                )}
              </MenuItem>
            </MenuItems>
          </Menu>
        </div>
      </div>
    </header>
  );
};

export default DashboardNavbar;

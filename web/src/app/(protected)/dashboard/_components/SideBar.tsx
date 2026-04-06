"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { HomeIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { LuFileText } from "react-icons/lu";
import { IoSettingsOutline } from "react-icons/io5";
import { RxHamburgerMenu } from "react-icons/rx";
import { BiMessageDetail } from "react-icons/bi";
import { FiLayers, FiMessageCircle } from "react-icons/fi";

import { cn } from "@/lib/utils";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: HomeIcon },
  { name: "Courses", href: "/dashboard/course", icon: LuFileText },
  { name: "Message", href: "/dashboard/messages", icon: BiMessageDetail },
  { name: "Flashcards", href: "/dashboard/flashcards", icon: FiLayers },
  { name: "AI Assistant", href: "/dashboard/chatbot", icon: FiMessageCircle },
  { name: "Settings", href: "/dashboard/settings", icon: IoSettingsOutline },
];

const SidebarContent = ({
  pathname,
  onNavigate,
}: {
  pathname: string;
  onNavigate?: () => void;
}) => (
  <div className="flex h-full grow flex-col gap-y-5 overflow-y-auto bg-white px-4 pb-4 pt-8 md:px-6 lg:border-r lg:border-gray-200">
    <nav className="flex flex-1 flex-col">
      <ul role="list" className="space-y-3">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <li key={item.name}>
              <Link
                href={item.href}
                onClick={onNavigate}
                className={cn(
                  "group flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition-colors",
                  isActive
                    ? "bg-primary-100 text-primary-600"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                )}
              >
                <span
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-full transition-colors",
                    isActive
                      ? "bg-primary text-white"
                      : "bg-gray-100 text-gray-500 group-hover:bg-white"
                  )}
                >
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <span>{item.name}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  </div>
);

const SideBar = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  return (
    <>
      <div className="fixed left-4 top-5 z-[60] lg:hidden">
        <button
          type="button"
          aria-label="Open menu"
          onClick={() => setSidebarOpen(true)}
          className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-700 shadow-sm transition-colors hover:bg-gray-50"
        >
          <RxHamburgerMenu className="h-5 w-5" />
        </button>
      </div>

      {isSidebarOpen && (
        <div className="fixed inset-0 z-[70] lg:hidden">
          <button
            type="button"
            aria-label="Close menu overlay"
            onClick={() => setSidebarOpen(false)}
            className="absolute inset-0 bg-gray-900/40"
          />
          <div className="absolute inset-y-0 left-0 flex w-72 flex-col bg-white shadow-xl">
            <div className="flex items-center justify-end p-4">
              <button
                type="button"
                aria-label="Close menu"
                onClick={() => setSidebarOpen(false)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl text-gray-600 transition-colors hover:bg-gray-100"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
            <SidebarContent
              pathname={pathname}
              onNavigate={() => setSidebarOpen(false)}
            />
          </div>
        </div>
      )}

      <aside className="fixed left-0 top-[98px] z-50 hidden h-[calc(100vh-98px)] w-60 lg:flex">
        <SidebarContent pathname={pathname} />
      </aside>
    </>
  );
};

export default SideBar;

"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { RxChevronDown, RxHamburgerMenu } from "react-icons/rx";
import { Button } from "@/components/ui/Button";

import logo from "../../../../public/assets/images/logo.svg";

interface NavLink {
  name: string;
  href: string;
  children?: { name: string; href: string }[];
}

const navLinks: NavLink[] = [
  { name: "Home", href: "/" },
  { name: "About Us", href: "/#about" },
  {
    name: "Services",
    href: "/#services",
    children: [
      { name: "Courses", href: "/courses" },
      { name: "Mentors", href: "/mentors" },
      { name: "Programs", href: "/programs" },
    ],
  },
  {
    name: "Partners & Sponsors",
    href: "/partners",
    children: [
      { name: "Our Partners", href: "/partners" },
      { name: "Funding Opportunities", href: "/funding" },
      { name: "Become a Sponsor", href: "/sponsor" },
    ],
  },
];

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openMobileDropdown, setOpenMobileDropdown] = useState<string | null>(
    null
  );
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (!isMobileMenuOpen) {
      setOpenMobileDropdown(null);
    }
  }, [isMobileMenuOpen]);

  const desktopTextColor = isScrolled ? "text-gray-800" : "text-white";

  return (
    <header
      className={cx(
        "fixed inset-x-0 top-0 z-50 w-full transition-all duration-300",
        isScrolled
          ? "bg-white/95 shadow-md backdrop-blur-md"
          : "bg-transparent"
      )}
    >
      <div className="mx-auto max-w-7xl px-4 py-2 sm:px-6 lg:px-8">
        <div className="hidden h-20 items-center justify-between md:flex">
          <Link href="/" className="flex h-16 items-center">
            <Image
              src={logo}
              alt="GrowTeens Logo"
              className="h-10 w-auto"
              priority
            />
          </Link>

          <nav className="flex flex-1 items-center justify-center gap-4 lg:gap-8">
            {navLinks.map((link) => (
              <div key={link.name} className="group relative">
                {link.children ? (
                  <>
                    <button
                      type="button"
                      className={cx(
                        "flex items-center gap-1 px-2 text-sm font-bold transition-colors lg:text-base",
                        desktopTextColor
                      )}
                    >
                      <span>{link.name}</span>
                      <RxChevronDown className="transition-transform duration-200 group-hover:rotate-180" />
                    </button>
                    <div className="pointer-events-none absolute left-0 top-full pt-4 opacity-0 transition-all duration-200 group-hover:pointer-events-auto group-hover:opacity-100">
                      <div className="min-w-[220px] rounded-xl border border-gray-100 bg-white p-2 shadow-xl">
                        {link.children.map((child) => (
                          <Link
                            key={child.name}
                            href={child.href}
                            className="block rounded-lg px-3 py-2 text-sm font-medium text-gray-800 transition-colors hover:bg-primary-100 hover:text-primary-500"
                          >
                            {child.name}
                          </Link>
                        ))}
                      </div>
                    </div>
                  </>
                ) : (
                  <Link
                    href={link.href}
                    className={cx(
                      "px-2 text-sm font-bold transition-colors hover:text-primary-300 lg:text-base",
                      desktopTextColor
                    )}
                  >
                    {link.name}
                  </Link>
                )}
              </div>
            ))}
          </nav>

          <div className="flex items-center gap-4">
            <Button
              onClick={() => router.push("/auth/signin")}
              variant="outline"
              size="sm"
              className={cx(
                "lg:px-5 lg:py-2.5 lg:text-base",
                isScrolled
                  ? "border-gray-300 text-gray-800 hover:bg-gray-100"
                  : "border-white text-white hover:bg-white/15 hover:text-white"
              )}
            >
              Sign in
            </Button>
            <Button
              onClick={() => router.push("/auth/signup")}
              variant="primary"
              size="sm"
              className="lg:px-5 lg:py-2.5 lg:text-base"
            >
              Join now
            </Button>
          </div>
        </div>

        <div className="flex h-16 items-center justify-between md:hidden">
          <Link href="/" className="flex items-center">
            <Image src={logo} alt="GrowTeens Logo" className="h-10 w-auto" priority />
          </Link>

          <button
            type="button"
            aria-label="Toggle menu"
            aria-expanded={isMobileMenuOpen}
            onClick={() => setIsMobileMenuOpen((prev) => !prev)}
            className={cx(
              "rounded-md p-2 transition-colors",
              isScrolled
                ? "text-gray-800 hover:bg-gray-100"
                : "text-white hover:bg-white/15"
            )}
          >
            <RxHamburgerMenu className="h-6 w-6" />
          </button>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="border-t border-gray-100 bg-white shadow-lg md:hidden">
          <nav className="space-y-2 px-4 py-4">
            {navLinks.map((link) => (
              <div key={link.name}>
                {link.children ? (
                  <>
                    <button
                      type="button"
                      onClick={() =>
                        setOpenMobileDropdown((prev) =>
                          prev === link.name ? null : link.name
                        )
                      }
                      className="flex w-full items-center justify-between py-2 text-left text-base font-medium text-gray-800"
                    >
                      <span>{link.name}</span>
                      <RxChevronDown
                        className={cx(
                          "transition-transform duration-200",
                          openMobileDropdown === link.name && "rotate-180"
                        )}
                      />
                    </button>
                    {openMobileDropdown === link.name && (
                      <div className="mt-2 space-y-1 rounded-xl bg-gray-50 p-2">
                        {link.children.map((child) => (
                          <Link
                            key={child.name}
                            href={child.href}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="block rounded-lg px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-primary-100 hover:text-primary-500"
                          >
                            {child.name}
                          </Link>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <Link
                    href={link.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block py-2 text-base font-medium text-gray-800 transition-colors hover:text-primary-500"
                  >
                    {link.name}
                  </Link>
                )}
              </div>
            ))}

            <div className="space-y-3 pt-3">
              <Button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  router.push("/auth/signup");
                }}
                fullWidth
              >
                Join now
              </Button>
              <Button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  router.push("/auth/signin");
                }}
                variant="outline"
                fullWidth
              >
                Sign in
              </Button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}

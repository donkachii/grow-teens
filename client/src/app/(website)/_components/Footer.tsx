"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { toast } from "react-toastify";
import {
  FaFacebook,
  FaInstagram,
  FaLinkedin,
  FaTwitter,
  FaYoutube,
} from "react-icons/fa";

import { Button } from "@/components/ui/Button";
import logo from "../../../../public/assets/images/logo.svg";

const quickLinks = [
  { label: "About Us", href: "/about" },
  { label: "Our Programs", href: "/programs" },
  { label: "Mentors", href: "/mentors" },
  { label: "Partners", href: "/partners" },
  { label: "FAQ", href: "/faq" },
];

const socialLinks = [
  { label: "Facebook", icon: FaFacebook, href: "#" },
  { label: "Twitter", icon: FaTwitter, href: "#" },
  { label: "Instagram", icon: FaInstagram, href: "#" },
  { label: "LinkedIn", icon: FaLinkedin, href: "#" },
  { label: "YouTube", icon: FaYoutube, href: "#" },
];

const Footer = () => {
  const [email, setEmail] = useState("");

  const handleSubscribe = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    toast.success("Thank you for subscribing to our newsletter.");
    setEmail("");
  };

  return (
    <footer className="bg-gray-900 py-12 text-white md:py-16">
      <div className="mx-auto max-w-7xl px-[5%]">
        <div className="mb-12 grid gap-10 md:grid-cols-2 lg:mb-16 lg:grid-cols-[2fr_1fr_1fr_1fr] lg:gap-8">
          <div className="max-w-full lg:max-w-[90%]">
            <Link href="/" className="mb-6 inline-block">
              <Image
                src={logo}
                alt="GrowTeens Logo"
                className="h-auto w-[180px]"
                priority
              />
            </Link>

            <p className="mb-6 text-gray-300">
              Empowering African teenagers with the skills, knowledge, and
              support they need to thrive in the digital age and become leaders
              in their communities.
            </p>

            <div className="flex flex-wrap gap-3">
              {socialLinks.map(({ label, icon: Icon, href }) => (
                <Link
                  key={label}
                  href={href}
                  aria-label={label}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full text-white/80 transition-colors hover:bg-white/10 hover:text-white"
                >
                  <Icon className="h-5 w-5" />
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h3 className="mb-6 text-lg font-semibold">Quick Links</h3>
            <div className="space-y-3">
              {quickLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="block text-white/90 transition-colors hover:text-primary-300"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h3 className="mb-6 text-lg font-semibold">Contact</h3>
            <div className="space-y-3 text-gray-300">
              <p>26 Innovation Avenue</p>
              <p>Lagos, Nigeria</p>
              <p>contact@growteens.org</p>
              <p>+234 800 123 4567</p>
            </div>
          </div>

          <div>
            <h3 className="mb-6 text-lg font-semibold">Stay Updated</h3>
            <p className="mb-4 text-gray-300">
              Subscribe to our newsletter for updates on programs, events, and
              success stories.
            </p>

            <form onSubmit={handleSubscribe} className="flex flex-col gap-3 sm:flex-row">
              <input
                type="email"
                placeholder="Your Email Here"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="min-w-0 flex-1 rounded-md border border-white/10 bg-white px-4 py-3 text-black outline-none transition focus:border-primary-300"
              />
              <Button type="submit" className="shrink-0">
                Subscribe
              </Button>
            </form>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

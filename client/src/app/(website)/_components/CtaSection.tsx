"use client";

import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/Button";
import Image from "next/image";

const CtaSection = () => {
  const router = useRouter();

  return (
    <section className="relative overflow-hidden bg-primary-100/70 py-16 md:py-24">
      <div className="absolute right-[-5%] top-[20%] h-72 w-72 rounded-full bg-primary opacity-5" />
      <div className="absolute bottom-[-10%] left-[-5%] h-64 w-64 rounded-full bg-secondary opacity-5" />

      <div className="relative z-10 mx-auto flex max-w-7xl flex-col items-center justify-between gap-12 px-4 sm:px-6 lg:flex-row lg:gap-6 lg:px-8">
        <div className="max-w-3xl text-center lg:max-w-[55%] lg:text-left">
          <p className="mb-3 text-base font-semibold text-primary-600 md:text-lg">
            Ready to Make an Impact?
          </p>
          <h2 className="mb-6 text-3xl font-bold leading-tight text-gray-900 md:text-5xl">
            Join GrowTeens today and be part of Africa&apos;s bright future
          </h2>
          <p className="mb-8 text-lg leading-8 text-gray-700 md:text-xl">
            Whether you&apos;re a student looking to gain new skills, a mentor
            wanting to share your knowledge, or a sponsor interested in
            supporting our mission, there&apos;s a place for you in our
            community.
          </p>

          <div className="flex flex-col gap-4 sm:flex-row sm:justify-center lg:justify-start">
            <Button
              size="lg"
              className="min-h-[60px] px-8 text-lg"
              onClick={() => router.push("/auth/signup")}
            >
              Join as a Student
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="min-h-[60px] px-8 text-lg"
              onClick={() => router.push("/volunteer")}
            >
              Become a Mentor
            </Button>
          </div>
        </div>

        <div className="hidden max-w-[40%] lg:block">
          <Image
            src="/images/cta-image.svg"
            alt="Students collaborating"
            className="h-auto w-full object-contain"
            width={500}
            height={500}
          />
        </div>
      </div>
    </section>
  );
};

export default CtaSection;

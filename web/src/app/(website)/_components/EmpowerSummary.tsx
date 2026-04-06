"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { RxChevronRight } from "react-icons/rx";

import { Button } from "@/components/ui/Button";
import manFixingDevice from "../../../../public/assets/images/man-fixing.svg";

const EmpowerSummary = () => {
  const router = useRouter();

  return (
    <section className="bg-secondary-200 px-[5%] py-10 md:py-24">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 gap-y-12 md:grid-cols-2 md:items-center md:gap-x-12 lg:gap-x-20">
          <div>
            <p className="mb-3 font-semibold text-primary-600 md:mb-4">
              Empower
            </p>
            <h2 className="mb-4 text-4xl font-bold leading-tight text-gray-900 md:text-5xl">
              Unlock Your Potential with GrowTeens Programs
            </h2>
            <p className="mb-6 text-gray-700 md:mb-8">
              Participating in GrowTeens programs equips teenagers with
              essential digital, entrepreneurial, and leadership skills. This
              transformative experience prepares them for a successful future in
              the global economy.
            </p>
            <div className="grid grid-cols-1 gap-6 py-2 sm:grid-cols-2">
              <div>
                <h3 className="mb-2 text-2xl font-semibold md:text-3xl lg:text-4xl">
                  Skills
                </h3>
                <p className="text-gray-700">
                  Gain valuable skills for the future of work.
                </p>
              </div>
              <div>
                <h3 className="mb-2 text-2xl font-semibold md:text-3xl lg:text-4xl">
                  Opportunities
                </h3>
                <p className="text-gray-700">
                  Access mentorship and entrepreneurial support for growth.
                </p>
              </div>
            </div>
            <div className="mt-6 flex flex-wrap items-center gap-4 md:mt-8">
              <Button variant="outline" onClick={() => router.push("/auth/signup")}>
                Join Us
              </Button>
              <Button variant="ghost" onClick={() => router.push("/about")}>
                Learn More <RxChevronRight />
              </Button>
            </div>
          </div>
          <Image
            src={manFixingDevice}
            alt="Man fixing a device"
            className="w-full object-cover"
            width={100}
            height={100}
          />
        </div>
      </div>
    </section>
  );
};

export default EmpowerSummary;

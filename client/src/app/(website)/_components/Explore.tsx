/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { RxChevronRight } from "react-icons/rx";

import handon from "../../../../public/assets/images/handson.svg";
import mentors from "../../../../public/assets/images/mentors.svg";
import unlocking from "../../../../public/assets/images/unlocking.svg";

interface InsightData {
  title: string;
  description: string;
  cta: string;
  ctaLink?: string;
  image: string | any;
}

const insights: InsightData[] = [
  {
    title: "Unlocking Potential Through Innovative Learning Experiences",
    description:
      "Our programs equip teenagers with essential skills for the digital age.",
    cta: "Explore",
    image: unlocking,
  },
  {
    title: "Hands-On Training for Real-World Challenges",
    description:
      "Engage in practical workshops that foster creativity and problem-solving.",
    cta: "Join",
    ctaLink: "/auth/signin",
    image: handon,
  },
  {
    title: "Mentorship Programs to Guide Future Leaders",
    description:
      "Connect with experienced mentors who inspire and support your journey.",
    cta: "Connect",
    image: mentors,
  },
];

const Explore = () => {
  const router = useRouter();

  return (
    <section className="px-[5%] py-10 md:py-24">
      <div className="container mx-auto">
        <div className="mb-12 md:mb-18 lg:mb-20">
          <div className="max-w-lg">
            <h2 className="text-4xl font-bold leading-[1.2] text-secondary-600 md:text-5xl lg:text-6xl">
              Empowering Youth with Skills for a Bright Future
            </h2>
          </div>
        </div>
        <div className="grid grid-cols-1 items-start gap-y-12 md:grid-cols-3 md:gap-x-8 md:gap-y-16 lg:gap-x-12">
          {insights.map((insight, idx) => (
            <div className="flex flex-col" key={idx}>
              <div className="mb-6 md:mb-8">
                <Image
                  src={insight.image}
                  alt={insight.title}
                  className="h-auto w-full"
                />
              </div>
              <h3 className="mb-4 text-xl font-semibold text-gray-900 md:text-2xl">
                {insight.title}
              </h3>
              <p className="text-gray-700">{insight.description}</p>
              <div className="mt-6 flex gap-4 md:mt-8">
                <button
                  type="button"
                  onClick={() => router.push(insight.ctaLink ?? "/auth/signup")}
                  className="inline-flex items-center gap-1 font-medium text-primary transition-colors hover:text-primary-600"
                >
                  {insight.cta}
                  <RxChevronRight className="h-5 w-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Explore;

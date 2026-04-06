"use client";

import { useRouter } from "next/navigation";
import { RxChevronRight } from "react-icons/rx";

import { Button } from "@/components/ui/Button";

const PotentialSummary = () => {
  const router = useRouter();

  return (
    <section className="px-[5%] py-10 md:py-24">
      <div className="container mx-auto">
        <div className="flex flex-col items-start">
          <div className="mb-12 grid grid-cols-1 items-start justify-between gap-5 md:grid-cols-2 md:gap-x-12 md:gap-y-8 lg:gap-x-20">
            <div>
              <p className="mb-3 font-semibold text-primary-600 md:mb-4">
                Empower
              </p>
              <h2 className="text-4xl font-bold leading-tight text-gray-900 md:text-5xl">
                Unlock Your Potential with GrowTeens Programs
              </h2>
            </div>
            <div>
              <p className="text-gray-700 md:text-base">
                At GrowTeens, we provide essential digital skills training to
                prepare African teenagers for the future. Our entrepreneurial
                support fosters creativity and innovation, empowering youth to
                start their own ventures. Leadership development programs ensure
                that they become confident leaders in their communities.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 items-start gap-y-12 md:grid-cols-3 md:gap-x-8 md:gap-y-16 lg:gap-x-12">
            {[
              "Comprehensive Digital Skills Training for Teens",
              "Entrepreneurial Support to Launch Your Ideas",
              "Leadership Development for Future Change Makers",
            ].map((title) => (
              <div key={title}>
                <div className="mb-5 md:mb-6">
                  <img
                    src="https://d22po4pjz3o32e.cloudfront.net/relume-icon.svg"
                    alt="icon"
                    className="size-12"
                  />
                </div>
                <h3 className="mb-2 text-xl font-semibold text-secondary-600 md:mb-4 md:text-2xl lg:text-3xl">
                  {title}
                </h3>
                <p className="text-gray-700">
                  {title.includes("Digital")
                    ? "Our training equips teens with in-demand tech skills."
                    : title.includes("Entrepreneurial")
                    ? "We provide resources and mentorship for aspiring entrepreneurs."
                    : "Our programs cultivate the leaders of tomorrow."}
                </p>
              </div>
            ))}
          </div>
          <div className="mt-10 flex items-center gap-4 md:mt-14 lg:mt-16">
            <Button variant="outline" onClick={() => router.push("/auth/signup")}>
              Join Us
            </Button>
            <Button variant="ghost" onClick={() => router.push("/about")}>
              Learn More <RxChevronRight />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PotentialSummary;

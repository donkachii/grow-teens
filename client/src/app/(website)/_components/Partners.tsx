"use client";

import { useRouter } from "next/navigation";
import { RxChevronRight } from "react-icons/rx";

import { Button } from "@/components/ui/Button";

const partners = [
  { id: 1, name: "Microsoft", logo: "https://via.placeholder.com/150x80?text=Microsoft" },
  { id: 2, name: "Google", logo: "https://via.placeholder.com/150x80?text=Google" },
  { id: 3, name: "UNICEF", logo: "https://via.placeholder.com/150x80?text=UNICEF" },
  { id: 4, name: "African Development Bank", logo: "https://via.placeholder.com/150x80?text=AfDB" },
  { id: 5, name: "UNESCO", logo: "https://via.placeholder.com/150x80?text=UNESCO" },
  { id: 6, name: "MTN Foundation", logo: "https://via.placeholder.com/150x80?text=MTN" },
];

const Partners = () => {
  const router = useRouter();

  return (
    <section className="bg-gray-50 py-16 md:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div
          className="mb-12 flex flex-col justify-between gap-6 md:mb-16 md:flex-row md:items-end"
        >
          <div className="max-w-3xl">
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.16em] text-primary-600">
              Our Network
            </p>
            <h2 className="mb-4 text-3xl font-bold leading-tight text-gray-900 md:text-5xl">
              Partnering with global leaders to empower Africa&apos;s youth
            </h2>
            <p className="text-base leading-8 text-gray-600 md:text-lg">
              We collaborate with organizations that share our vision of
              creating opportunities for African teenagers and building a
              brighter future.
            </p>
          </div>
        </div>

        {/* <div className="mb-12 grid grid-cols-2 gap-8 md:mb-16 md:grid-cols-3 lg:grid-cols-6">
          {partners.map((partner) => (
            <div
              key={partner.id}
              className="flex h-[100px] items-center justify-center rounded-xl bg-white px-4 py-6 shadow-sm transition-shadow hover:shadow-md"
            >
              <img
                src={partner.logo}
                alt={partner.name}
                className="max-h-[80%] max-w-[90%] object-contain"
              />
            </div>
          ))}
        </div> */}

        <div
          className="rounded-2xl bg-primary-100/70 p-6 shadow-md md:p-10"
        >
          <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
            <div className="max-w-3xl">
              <h3 className="mb-3 text-2xl font-bold text-gray-900 md:text-3xl">
                Become a partner or sponsor
              </h3>
              <p className="leading-7 text-gray-600">
                Join our mission to empower Africa&apos;s future leaders.
                Together, we can create meaningful impact and sustainable change
                across the continent.
              </p>
            </div>

            <div className="flex w-full flex-col gap-4 sm:flex-row md:w-auto">
              <Button size="lg" onClick={() => router.push("/sponsor")}>
                Become a Sponsor
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => router.push("/partners")}
              >
                Learn More
                <RxChevronRight className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Partners;

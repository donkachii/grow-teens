"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { RxChevronRight } from "react-icons/rx";

import { Button } from "@/components/ui/Button";

interface ProgramProps {
  id: number;
  title: string;
  description: string;
  image: string;
  link: string;
}

const programs: ProgramProps[] = [
  {
    id: 1,
    title: "Digital Skills Academy",
    description:
      "Comprehensive training in web development, design, and digital marketing for teens aged 13-18.",
    image:
      "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=500&auto=format&fit=crop",
    link: "/programs/digital-skills",
  },
  {
    id: 2,
    title: "Youth Entrepreneurship",
    description:
      "Guidance and resources to help teens develop and launch their own business ideas.",
    image:
      "https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=500&auto=format&fit=crop",
    link: "/programs/entrepreneurship",
  },
  {
    id: 3,
    title: "Mentorship Program",
    description:
      "Connect with industry professionals who provide guidance and career advice.",
    image:
      "https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?q=80&w=500&auto=format&fit=crop",
    link: "/programs/mentorship",
  },
  {
    id: 4,
    title: "Leadership Development",
    description:
      "Workshops and activities designed to build confidence and leadership skills.",
    image:
      "https://images.unsplash.com/photo-1538805060514-97d9cc17730c?q=80&w=500&auto=format&fit=crop",
    link: "/programs/leadership",
  },
];

const Programs = () => {
  const router = useRouter();

  return (
    <section className="py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div
          className="mb-10 flex flex-col justify-between gap-6 lg:mb-14 lg:flex-row lg:items-end"
        >
          <div className="max-w-3xl">
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.16em] text-primary-600">
              Our Programs
            </p>
            <h2 className="mb-4 text-3xl font-bold leading-tight  md:text-5xl">
              Comprehensive initiatives designed for teen development
            </h2>
            <p className="max-w-3xl text-base leading-8 md:text-lg">
              Our programs are structured to provide African teenagers with both
              theoretical knowledge and practical skills that prepare them for
              future success.
            </p>
          </div>

          <Link
            href="/programs"
            className="inline-flex items-center gap-1 font-medium text-primary transition-colors hover:text-primary-600"
          >
            View all programs
            <RxChevronRight className="h-5 w-5" />
          </Link>
        </div>

        <div className="grid gap-8 md:grid-cols-2 md:gap-10">
          {programs.map((program) => (
            <article
              key={program.id}
              className="overflow-hidden rounded-2xl bg-white shadow-md transition-shadow hover:shadow-lg"
            >
              <div className="relative h-60">
                <img
                  src={program.image}
                  alt={program.title}
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              </div>

              <div className="p-6">
                <h3 className="mb-3 text-2xl font-bold text-gray-800">
                  {program.title}
                </h3>
                <p className="mb-5 leading-7 text-gray-600">
                  {program.description}
                </p>
                <button
                  type="button"
                  onClick={() => router.push(program.link)}
                  className="inline-flex items-center gap-1 font-semibold text-primary transition-colors hover:text-primary-600"
                >
                  Learn More
                  <RxChevronRight className="h-5 w-5" />
                </button>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-10 flex justify-start md:mt-14">
          <Button size="lg" onClick={() => router.push("/programs")}>
            Explore All Programs
          </Button>
        </div>
      </div>
    </section>
  );
};

export default Programs;

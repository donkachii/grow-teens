"use client";

import { useRouter } from "next/navigation";
import {
  FiAward,
  FiBookOpen,
  FiGlobe,
  FiHeart,
  FiTarget,
  FiUsers,
} from "react-icons/fi";
import { RxChevronRight } from "react-icons/rx";

import { Button } from "@/components/ui/Button";

const objectives = [
  {
    icon: FiTarget,
    title: "Skill Development",
    description:
      "Equip African teens with digital and soft skills needed for the modern workforce.",
    colorClasses: "border-primary text-primary bg-primary-100/60",
    accentClasses: "bg-primary/10",
    delay: 0.1,
  },
  {
    icon: FiUsers,
    title: "Mentorship Access",
    description:
      "Connect teens with experienced mentors who provide guidance and support.",
    colorClasses: "border-secondary-600 text-secondary-600 bg-secondary-100/70",
    accentClasses: "bg-secondary/10",
    delay: 0.2,
  },
  {
    icon: FiAward,
    title: "Leadership Training",
    description:
      "Develop the next generation of confident, ethical African leaders.",
    colorClasses: "border-primary text-primary bg-primary-100/60",
    accentClasses: "bg-primary/10",
    delay: 0.3,
  },
  {
    icon: FiGlobe,
    title: "Global Exposure",
    description:
      "Provide opportunities for teens to engage with global platforms and networks.",
    colorClasses: "border-secondary-600 text-secondary-600 bg-secondary-100/70",
    accentClasses: "bg-secondary/10",
    delay: 0.4,
  },
  {
    icon: FiBookOpen,
    title: "Educational Support",
    description:
      "Supplement formal education with practical, industry-relevant knowledge.",
    colorClasses: "border-primary text-primary bg-primary-100/60",
    accentClasses: "bg-primary/10",
    delay: 0.5,
  },
  {
    icon: FiHeart,
    title: "Community Building",
    description:
      "Foster a supportive community where teens can collaborate and grow together.",
    colorClasses: "border-secondary-600 text-secondary-600 bg-secondary-100/70",
    accentClasses: "bg-secondary/10",
    delay: 0.6,
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: (delay: number) => ({
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 12,
      delay,
    },
  }),
};

const Objectives = () => {
  const router = useRouter();

  return (
    <section className="bg-gray-50 py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 flex flex-col justify-between gap-6 md:mb-16 md:flex-row md:items-end md:gap-12">
          <div className="max-w-2xl">
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.16em] text-primary-600">
              Our Mission
            </p>
              <h2
              className="text-3xl font-bold leading-tight text-gray-900 md:text-5xl"
            >
              GrowTeens Strategic Objectives
            </h2>
          </div>

          <p
            className="max-w-2xl text-base leading-8 text-gray-700 md:text-lg"
          >
            Our objectives are centered on creating holistic development
            opportunities for African teenagers, preparing them to thrive in an
            increasingly digital global economy while maintaining strong
            community ties.
          </p>
        </div>

        <div className="mb-12 grid gap-8 md:mb-16 md:grid-cols-2 lg:grid-cols-3">
          {objectives.map((objective) => {
            const Icon = objective.icon;

            return (
              <article
                key={objective.title}
                className={`relative overflow-hidden rounded-2xl border-t-4 bg-white p-6 shadow-md transition-shadow hover:shadow-xl ${objective.colorClasses}`}
              >
                <div
                  className={`mb-4 flex h-[52px] w-[52px] items-center justify-center rounded-full ${objective.colorClasses}`}
                >
                  <Icon className="h-7 w-7" />
                </div>

                <h3 className="mb-3 text-2xl font-bold text-gray-800">
                  {objective.title}
                </h3>
                <p className="text-base leading-7 text-gray-600">
                  {objective.description}
                </p>

                <div
                  className={`absolute -bottom-3 -right-3 h-14 w-14 rounded-full ${objective.accentClasses}`}
                />
              </article>
            );
          })}
        </div>

        <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center">
          <Button size="lg" onClick={() => router.push("/about")}>
            Learn More About Us
          </Button>
          <Button
            variant="outline"
            size="lg"
            onClick={() => router.push("/auth/signup")}
          >
            Join Our Program
            <RxChevronRight className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default Objectives;

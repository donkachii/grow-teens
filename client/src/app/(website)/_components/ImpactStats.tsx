"use client";
  
import CountUp from "react-countup";

interface StatProps {
  value: number;
  label: string;
  suffix?: string;
  delay: number;
}

const StatCounter = ({ value, label, suffix = "+", delay }: StatProps) => {
  return (
    <div
      className="text-center"
    >
      <h3
        className="mb-2 text-5xl font-bold tracking-tight text-primary md:text-6xl"
      >
          <CountUp
            start={0}
            end={value}
            duration={2.5}
            separator=","
            suffix={suffix}
            delay={delay}
            useEasing
          />
      </h3>
      <p className="text-base text-gray-600 md:text-lg">{label}</p>
    </div>
  );
};

const ImpactStats = () => {
  return (
    <section className="relative overflow-hidden bg-primary-100/60 py-16 md:py-24">
      <div
        className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-primary-100 opacity-30"
      />
      <div
        className="absolute -bottom-12 -left-16 h-52 w-52 rounded-full bg-secondary-100 opacity-30"
      />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto mb-10 max-w-3xl text-center md:mb-16">
          <p
            className="mb-3 text-sm font-semibold uppercase tracking-[0.16em] text-primary-600"
          >
            Our Impact
          </p>
          <h2
            className="mb-4 text-3xl font-bold leading-tight text-gray-900 md:text-5xl"
          >
            Transforming the lives of African teenagers through education and
            mentorship
          </h2>
          <p
            className="text-base leading-8 text-gray-600 md:text-lg"
          >
            Since our founding, we&apos;ve been committed to creating meaningful
            change in communities across Africa. These numbers represent real
            lives transformed.
          </p>
        </div>

        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4 lg:gap-8">
          <StatCounter value={5000} label="Students Trained" delay={0.1} />
          <StatCounter value={120} label="Communities Reached" delay={0.2} />
          <StatCounter value={85} label="Partner Organizations" delay={0.3} />
          <StatCounter value={95} label="Success Rate" suffix="%" delay={0.4} />
        </div>
      </div>
    </section>
  );
};

export default ImpactStats;

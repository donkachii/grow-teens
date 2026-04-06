"use client";

import { useState } from "react";
import { FaQuoteLeft } from "react-icons/fa";
import { IoChevronBack, IoChevronForward } from "react-icons/io5";

interface TestimonialProps {
  id: number;
  quote: string;
  name: string;
  title: string;
  avatarUrl: string;
}

const testimonials: TestimonialProps[] = [
  {
    id: 1,
    quote:
      "GrowTeens changed my life. I learned web development skills that helped me secure a freelance job while still in school. The mentors truly care about our success.",
    name: "Adewale Johnson",
    title: "Digital Skills Graduate, Lagos",
    avatarUrl:
      "https://images.unsplash.com/photo-1507152832244-10d45c7eda57?q=80&w=200&auto=format&fit=crop",
  },
  {
    id: 2,
    quote:
      "The entrepreneurship program gave me the confidence to start my own small business. From idea validation to pitching, they covered everything I needed to know.",
    name: "Sarah Mensah",
    title: "Entrepreneur, Accra",
    avatarUrl:
      "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?q=80&w=200&auto=format&fit=crop",
  },
  {
    id: 3,
    quote:
      "I never thought I could be a leader until I joined the leadership program. Now I'm running a community initiative in my neighborhood with skills I learned from GrowTeens.",
    name: "Emmanuel Okafor",
    title: "Leadership Program Alum, Abuja",
    avatarUrl:
      "https://images.unsplash.com/photo-1463453091185-61582044d556?q=80&w=200&auto=format&fit=crop",
  },
  {
    id: 4,
    quote:
      "The mentorship I received opened doors I never knew existed. My mentor helped me navigate educational opportunities and scholarship applications successfully.",
    name: "Fatima Ahmed",
    title: "University Student, Cairo",
    avatarUrl:
      "https://images.unsplash.com/photo-1619970096024-c99f1dd43905?q=80&w=200&auto=format&fit=crop",
  },
];

const Testimonials = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handlePrev = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? testimonials.length - 1 : prevIndex - 1
    );
  };

  const handleNext = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === testimonials.length - 1 ? 0 : prevIndex + 1
    );
  };

  const current = testimonials[currentIndex];

  return (
    <section className="relative overflow-hidden bg-primary py-16 md:py-24">
      <div className="absolute -left-[10%] -top-[5%] h-72 w-72 rounded-full bg-white/10" />
      <div className="absolute -bottom-[10%] -right-[5%] h-64 w-64 rounded-full bg-white/10" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center md:mb-16">
          <p 
            className="mb-3 text-sm font-semibold uppercase tracking-[0.16em] text-tertiary-300"
          >
            Success Stories
          </p>
          <h2
            className="mx-auto max-w-3xl text-3xl font-bold leading-tight text-white md:text-5xl"
          >
            Hear from the teens we&apos;ve empowered
          </h2>
        </div>

        <div className="flex flex-col items-center">
          <div
            className="mx-auto mb-10 max-w-4xl text-center"
          >
            <div className="mb-6 flex justify-center text-4xl text-tertiary-300">
              <FaQuoteLeft />
            </div>
            <p className="mb-8 text-xl font-medium leading-9 text-white md:text-3xl md:leading-relaxed">
              {current.quote}
            </p>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <div className="relative h-[72px] w-[72px] overflow-hidden rounded-full border-[3px] border-tertiary-300">
                <img
                  src={current.avatarUrl}
                  alt={current.name}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="text-center sm:text-left">
                <p className="font-bold text-white">{current.name}</p>
                <p className="text-white/80">{current.title}</p>
              </div>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-center">
            <button
              type="button"
              aria-label="Previous testimonial"
              onClick={handlePrev}
              className="mx-2 rounded-full p-3 text-white transition-colors hover:bg-white/10"
            >
              <IoChevronBack className="h-5 w-5 md:h-6 md:w-6" />
            </button>

            <div className="mx-4 flex">
              {testimonials.map((testimonial, index) => (
                <button
                  key={testimonial.id}
                  type="button"
                  aria-label={`Go to testimonial ${index + 1}`}
                  onClick={() => setCurrentIndex(index)}
                  className={`mx-1 h-2.5 w-2.5 rounded-full transition-colors ${
                    index === currentIndex ? "bg-tertiary-300" : "bg-white/40"
                  }`}
                />
              ))}
            </div>

            <button
              type="button"
              aria-label="Next testimonial"
              onClick={handleNext}
              className="mx-2 rounded-full p-3 text-white transition-colors hover:bg-white/10"
            >
              <IoChevronForward className="h-5 w-5 md:h-6 md:w-6" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;

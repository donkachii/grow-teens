"use client";

import type { FormEvent } from "react";
import { useState } from "react";
import { FiSend } from "react-icons/fi";
import { toast } from "react-toastify";

import { Button } from "@/components/ui/Button";

const Newsletter = () => {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!email) {
      toast.error("Email is required");
      return;
    }

    setIsSubmitting(true);

    window.setTimeout(() => {
      toast.success("You've been added to our newsletter.");
      setEmail("");
      setIsSubmitting(false);
    }, 1500);
  };

  return (
    <section className="relative overflow-hidden bg-primary-600 py-12 text-white md:py-20">
      <div
        className="absolute -top-20 left-[10%] h-[200px] w-[200px] rounded-full bg-white/5"
      />
      <div
        className="absolute -bottom-[120px] right-[5%] h-[300px] w-[300px] rounded-full bg-white/[0.07]"
      />

      <div className="relative z-10 mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col justify-between gap-8 md:flex-row md:items-start md:gap-12">
          <div
            className="max-w-full text-center md:max-w-[50%] md:text-left"
          >
            <h2 className="mb-4 text-3xl font-bold leading-tight md:text-5xl">
              Stay Updated with Our Latest Programs
            </h2>
            <p className="text-base leading-8 text-white/90 md:text-lg">
              Join our newsletter to receive updates on upcoming trainings,
              mentorship opportunities, and success stories from GrowTeens
              across Africa.
            </p>
          </div>

          <div
            className="w-full md:w-[45%]"
          >
            <div className="rounded-2xl bg-white p-6 shadow-[0_10px_30px_rgba(0,0,0,0.1)] md:p-8">
              <form onSubmit={handleSubmit}>
                <p className="mb-4 font-medium text-gray-700">
                  Subscribe to our newsletter
                </p>
                <div className="mb-4">
                  <input
                    placeholder="Your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-4 text-gray-800 outline-none transition focus:border-primary"
                  />
                </div>
                <Button
                  type="submit"
                  fullWidth
                  size="lg"
                  disabled={isSubmitting}
                  className="shadow-lg hover:-translate-y-0.5 hover:shadow-xl"
                >
                  <FiSend className="h-4 w-4" />
                  {isSubmitting ? "Submitting" : "Subscribe"}
                </Button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Newsletter;

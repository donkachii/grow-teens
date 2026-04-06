"use client";

import { useRouter } from "next/navigation";
import { ArrowRightIcon } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, EffectFade, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/effect-fade";
import "swiper/css/pagination";
import "swiper/css/autoplay";
import Image from "next/image";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";

import HeroBg1 from "../../../../public/assets/images/hero-background.svg";
import HeroBg2 from "../../../../public/assets/images/hero-background2.svg";
import HeroBg3 from "../../../../public/assets/images/hero-background3.svg";

const Hero = () => {
  const router = useRouter();
  const [activeIndex, setActiveIndex] = useState(0);
  const [loadedSlideIndexes, setLoadedSlideIndexes] = useState(
    () => new Set<number>([0]),
  );

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setLoadedSlideIndexes((prev) => {
        if (prev.has(1)) return prev;
        const next = new Set(prev);
        next.add(1);
        return next;
      });
    }, 1200);

    return () => window.clearTimeout(timeoutId);
  }, []);

  return (
    <section id="home" className="relative min-h-screen">
      {/* Lightweight fallback background */}
      <div className="absolute inset-0 z-0 bg-linear-to-br from-slate-900 via-slate-800 to-slate-900" />

      {/* Carousel Background */}
      <div className="absolute inset-0 z-0">
        <Swiper
          modules={[Autoplay, EffectFade, Pagination]}
          effect="fade"
          speed={1500}
          autoplay={{
            delay: 5000,
            disableOnInteraction: false,
          }}
          pagination={{
            clickable: true,
            renderBullet: function (index, className) {
              return (
                '<span class="' +
                className +
                '" style="background-color: white"></span>'
              );
            },
          }}
          loop={true}
          onSlideChange={(swiper) => {
            const realIndex = swiper.realIndex ?? 0;
            setActiveIndex(realIndex);
            setLoadedSlideIndexes((prev) => {
              if (prev.has(realIndex)) return prev;
              const next = new Set(prev);
              next.add(realIndex);
              return next;
            });
          }}
          className="h-full w-full"
        >
          <SwiperSlide>
            <div className="relative h-full w-full">
              {(activeIndex === 0 || loadedSlideIndexes.has(0)) && (
                <Image
                  src={HeroBg1}
                  alt="Hero Background 1"
                  fill
                  sizes="100vw"
                  className="w-full h-full object-cover"
                  priority
                  fetchPriority="high"
                />
              )}
            </div>
          </SwiperSlide>
          <SwiperSlide>
            <div className="relative h-full w-full">
              {(activeIndex === 1 || loadedSlideIndexes.has(1)) && (
                <Image
                  src={HeroBg2}
                  alt="Hero Background 2"
                  fill
                  sizes="100vw"
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              )}
            </div>
          </SwiperSlide>
          <SwiperSlide>
            <div className="relative h-full w-full">
              {(activeIndex === 2 || loadedSlideIndexes.has(2)) && (
                <Image
                  src={HeroBg3}
                  alt="Hero Background 3"
                  fill
                  sizes="100vw"
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              )}
            </div>
          </SwiperSlide>
        </Swiper>
      </div>

      {/* Readability overlay */}
      <div className="absolute inset-0 z-1 bg-black/55" />

      {/* Content */}
      <div className="relative z-10 mx-auto flex min-h-screen max-w-7xl items-center px-4 pt-24 pb-16 sm:px-6 sm:pt-28 sm:pb-20 lg:px-8">
        <div className="w-full max-w-3xl text-center lg:text-left">
          <div>
            <h1 className="mb-4 text-4xl text-white drop-shadow-xl md:text-5xl lg:text-6xl">
              Empowering African Teens for a Brighter Future
            </h1>

            <p className="mx-auto mb-8 max-w-2xl text-lg text-white drop-shadow-lg md:text-xl lg:mx-0 lg:max-w-xl">
              At GrowTeens, we are dedicated to equipping African teenagers with
              essential skills for success in the digital age. Our mission is to
              empower youth to become proactive contributors to the global
              economy.
            </p>

            <div className="flex flex-col items-stretch gap-4 sm:flex-row sm:items-center sm:justify-center sm:gap-6 lg:justify-start">
              <Button
                variant="primary"
                size="lg"
                onClick={() => router.push("/auth/signup")}
              >
                <span>Join Our Community</span>
                <ArrowRightIcon size={18} className="text-white" />
              </Button>

              <Button
                variant="ghost"
                size="lg"
                onClick={() => router.push("/#about")}
              >
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator with enhanced animation */}
      <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 z-10">
        <div className="h-10 w-6 border-2 border-white rounded-full flex items-center justify-center">
          <div className="h-2 w-2 bg-white rounded-full animate-bounce" />
        </div>
      </div>
    </section>
  );
};

export default Hero;

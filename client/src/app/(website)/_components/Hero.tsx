"use client";

import { useRouter } from "next/navigation";
import { Button, Text, Box, Container, Stack } from "@chakra-ui/react";
import { ArrowRight } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, EffectFade, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/effect-fade";
import "swiper/css/pagination";
import "swiper/css/autoplay";
import Image from "next/image";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { useEffect, useState } from "react";

const MotionText = motion(Text);
const MotionStack = motion(Stack);
const MotionButton = motion(Button);
const MotionBox = motion(Box);

import HeroBg1 from "../../../../public/assets/images/hero-background.svg";
import HeroBg2 from "../../../../public/assets/images/hero-background2.svg";
import HeroBg3 from "../../../../public/assets/images/hero-background3.svg";

const Hero = () => {
  const router = useRouter();
  const [isVisible, setIsVisible] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const [loadedSlideIndexes, setLoadedSlideIndexes] = useState(() => new Set<number>([0]));
  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: true,
  });

  useEffect(() => {
    if (inView) {
      setIsVisible(true);
    }
  }, [inView]);

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

  // Animation variants
  const containerVariant = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        when: "beforeChildren",
        staggerChildren: 0.3,
        delayChildren: 0.5,
      },
    },
  };

  const itemVariant = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: "easeOut" },
    },
  };

  const buttonVariant = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
    hover: {
      scale: 1.05,
      y: -5,
      transition: { duration: 0.3 },
      boxShadow: "0px 10px 20px rgba(0,0,0,0.2)",
    },
  };

  return (
    <section id="home" className="relative h-screen px-[5%]" ref={ref}>
      {/* Lightweight fallback background */}
      <div className="absolute inset-0 z-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" />

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
      <div className="absolute inset-0 z-[1] bg-black/55" />

      {/* Content */}
      <Container maxW="container.xl" mx="auto" h="full" position="relative" zIndex="10">
        <MotionStack
          h="full"
          direction="column"
          spacing={8}
          justify="center"
          align={{ base: "center", lg: "flex-start" }}
          textAlign={{ base: "center", lg: "left" }}
          pt={{ base: "20", md: "0" }}
          initial={false}
          animate={isVisible ? "visible" : "hidden"}
          variants={containerVariant}
        >
          <MotionBox maxW={{ base: "100%", lg: "60%" }} variants={itemVariant}>
            <MotionText
              as="h1"
              fontSize={{ base: "4xl", md: "5xl", lg: "6xl" }}
              color="white"
              lineHeight="1.2"
              className="drop-shadow-xl"
              mb={4}
              variants={itemVariant}
            >
              Empowering African Teens for a Brighter Future
            </MotionText>

            <MotionText
              fontSize={{ base: "lg", md: "xl" }}
              color="white"
              mb={8}
              maxW={{ base: "full", lg: "xl" }}
              className="drop-shadow-lg"
              variants={itemVariant}
            >
              At GrowTeens, we are dedicated to equipping African teenagers with
              essential skills for success in the digital age. Our mission is to
              empower youth to become proactive contributors to the global
              economy.
            </MotionText>

            <MotionStack
              direction={{ base: "column", sm: "row" }}
              spacing={{ base: 4, sm: 6 }}
              align={{ base: "center", lg: "flex-start" }}
              variants={itemVariant}
            >
              <MotionButton
                size="lg"
                height="60px"
                px={8}
                fontSize="lg"
                colorScheme="yellow"
                onClick={() => router.push("/auth/signup")}
                variants={buttonVariant}
                whileHover="hover"
                initial={false}
                animate={isVisible ? "visible" : "hidden"}
              >
                Join Our Community
              </MotionButton>

              <MotionButton
                size="lg"
                height="60px"
                px={8}
                fontSize="lg"
                variant="outline"
                rightIcon={<ArrowRight size={18} />}
                _hover={{ bg: "whiteAlpha.200" }}
                onClick={() => router.push("/#about")}
                variants={buttonVariant}
                initial={false}
                animate={isVisible ? "visible" : "hidden"}
              >
                Learn More
              </MotionButton>
            </MotionStack>
          </MotionBox>
        </MotionStack>
      </Container>

      {/* Scroll indicator with enhanced animation */}
      <MotionBox
        position="absolute"
        bottom="10"
        left="50%"
        transform="translateX(-50%)"
        zIndex="10"
        animate={{
          y: [0, 10, 0],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          repeatType: "loop",
        }}
      >
        <MotionBox
          h="10"
          w="6"
          border="2px"
          borderColor="white"
          borderRadius="full"
          display="flex"
          justifyContent="center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2, duration: 1 }}
        >
          <MotionBox
            w="2"
            h="2"
            bg="white"
            borderRadius="full"
            mt="2"
            animate={{
              y: [0, 5, 0],
              opacity: [1, 0.5, 1],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              repeatType: "loop",
            }}
          />
        </MotionBox>
      </MotionBox>
    </section>
  );
};

export default Hero;

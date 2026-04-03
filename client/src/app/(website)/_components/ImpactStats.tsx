"use client";

import React, { useRef } from "react";
import {
  chakra,
  Box,
  Flex,
  Grid,
  Heading,
  Text,
  shouldForwardProp,
} from "@chakra-ui/react";
import { motion, isValidMotionProp } from "framer-motion";
import { useInView } from "react-intersection-observer";
import CountUp from "react-countup";

// Create a MotionBox that forwards both motion and Chakra props
const MotionBox = chakra(motion.div, {
  shouldForwardProp: (prop) =>
    isValidMotionProp(prop) || shouldForwardProp(prop),
});

interface StatProps {
  value: number;
  label: string;
  suffix?: string;
  delay: number;
}

const StatCounter = ({ value, label, suffix = "+", delay }: StatProps) => {
  const countUpRef = useRef(null);
  const { ref, inView } = useInView({
    threshold: 0.3,
    triggerOnce: true,
  });

  return (
    <MotionBox
      ref={ref}
      initial={false}
      whileInView={{ opacity: 1, y: 0 }}
      //   transition={{ duration: 0.6, delay }}
      viewport={{ once: true }}
    >
      <Heading
        as="h2"
        fontSize={{ base: "4xl", md: "5xl", lg: "6xl" }}
        color="primary.500"
        mb={2}
        ref={countUpRef}
      >
        {inView ? (
          <CountUp
            start={0}
            end={value}
            duration={2.5}
            separator=","
            suffix={suffix}
            delay={delay}
            useEasing={true}
          />
        ) : (
          `0${suffix}`
        )}
      </Heading>
      <Text fontSize={{ base: "md", md: "lg" }} color="gray.600">
        {label}
      </Text>
    </MotionBox>
  );
};

const ImpactStats = () => {
  return (
    <Box
      as="section"
      py={{ base: 16, md: 24 }}
      bg="primary.50"
      position="relative"
      overflow="hidden"
    >
      {/* Decorative background elements */}
      <MotionBox
        position="absolute"
        top="-100px"
        right="-100px"
        w="300px"
        h="300px"
        borderRadius="full"
        bg="primary.100"
        opacity={0.3}
        zIndex={0}
        initial={false}
        whileInView={{ scale: 1, opacity: 0.3 }}
        // transition={{ duration: 1.5 }}
      />
      <MotionBox
        position="absolute"
        bottom="-50px"
        left="-80px"
        w="200px"
        h="200px"
        borderRadius="full"
        bg="secondary.100"
        opacity={0.3}
        zIndex={0}
        initial={false}
        whileInView={{ scale: 1, opacity: 0.3 }}
        // transition={{ duration: 1.5 }}
      />

      <Box maxW="container.xl" mx="auto" px="5%" position="relative" zIndex={1}>
        <Flex
          direction="column"
          align="center"
          textAlign="center"
          mb={{ base: 10, md: 16 }}
        >
          <MotionBox
            initial={false}
            whileInView={{ opacity: 1, y: 0 }}
            // transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <Text color="primary.600" fontWeight="semibold" mb={3}>
              Our Impact
            </Text>
          </MotionBox>
          <MotionBox
            initial={false}
            whileInView={{ opacity: 1, y: 0 }}
            // transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <Heading size={{ base: "xl", md: "2xl" }} maxW="3xl" mb={4}>
              Transforming the lives of African teenagers through education and
              mentorship
            </Heading>
          </MotionBox>
          <MotionBox
            initial={false}
            whileInView={{ opacity: 1 }}
            // transition={{ duration: 0.5, delay: 0.4 }}
            viewport={{ once: true }}
            maxW="3xl"
          >
            <Text fontSize={{ base: "md", md: "lg" }} color="gray.600">
              Since our founding, we&apos;ve been committed to creating
              meaningful change in communities across Africa. These numbers
              represent real lives transformed.
            </Text>
          </MotionBox>
        </Flex>

        <Grid
          templateColumns={{
            base: "1fr",
            md: "repeat(2, 1fr)",
            lg: "repeat(4, 1fr)",
          }}
          gap={{ base: 10, md: 6, lg: 8 }}
          textAlign="center"
        >
          <StatCounter value={5000} label="Students Trained" delay={0.1} />
          <StatCounter value={120} label="Communities Reached" delay={0.2} />
          <StatCounter value={85} label="Partner Organizations" delay={0.3} />
          <StatCounter value={95} label="Success Rate" suffix="%" delay={0.4} />
        </Grid>
      </Box>
    </Box>
  );
};

export default ImpactStats;

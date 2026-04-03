"use client";

import React from "react";
import {
  Box,
  Button,
  Flex,
  Heading,
  Image,
  Text,
  useBreakpointValue,
} from "@chakra-ui/react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

const MotionBox = motion(Box);
const MotionFlex = motion(Flex);

const CtaSection = () => {
  const router = useRouter();
  const isMobile = useBreakpointValue({ base: true, md: false });

  return (
    <Box
      as="section"
      bg="primary.50"
      py={{ base: 16, md: 24 }}
      px="5%"
      position="relative"
      overflow="hidden"
    >
      {/* Background decorative elements */}
      <Box
        position="absolute"
        top="20%"
        right="-5%"
        w="300px"
        h="300px"
        borderRadius="full"
        bg="primary.500"
        opacity="0.05"
        zIndex={0}
      />
      <Box
        position="absolute"
        bottom="-10%"
        left="-5%"
        w="250px"
        h="250px"
        borderRadius="full"
        bg="secondary.500"
        opacity="0.05"
        zIndex={0}
      />

      <Flex
        maxW="container.xl"
        mx="auto"
        direction={{ base: "column", lg: "row" }}
        justify="space-between"
        align="center"
        position="relative"
        zIndex={1}
        gap={{ base: 12, lg: 6 }}
      >
        <MotionBox
          initial={false}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          maxW={{ base: "100%", lg: "55%" }}
          textAlign={{ base: "center", lg: "left" }}
        >
          <Text
            color="primary.600"
            fontWeight="semibold"
            mb={3}
            fontSize={{ base: "md", md: "lg" }}
          >
            Ready to Make an Impact?
          </Text>
          <Heading size={{ base: "xl", md: "2xl" }} mb={6} lineHeight="1.2">
            Join GrowTeens today and be part of Africa&apos;s bright future
          </Heading>

          <Text fontSize={{ base: "lg", md: "xl" }} mb={8} color="gray.700">
            Whether you&apos;re a student looking to gain new skills, a mentor
            wanting to share your knowledge, or a sponsor interested in
            supporting our mission, there&apos;s a place for you in our
            community.
          </Text>
          <MotionFlex
            direction={{ base: "column", sm: "row" }}
            gap={4}
            justify={{ base: "center", lg: "flex-start" }}
            initial={false}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            viewport={{ once: true }}
          >
            <Button
              size="lg"
              colorScheme="primary"
              px={8}
              height="60px"
              fontSize="lg"
              onClick={() => router.push("/auth/signup")}
            >
              Join as a Student
            </Button>
            <Button
              size="lg"
              variant="outline"
              colorScheme="primary"
              px={8}
              height="60px"
              fontSize="lg"
              onClick={() => router.push("/volunteer")}
            >
              Become a Mentor
            </Button>
          </MotionFlex>
        </MotionBox>

        {!isMobile && (
          <MotionBox
            initial={false}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            maxW="40%"
          >
            <Image
              src="https://d22po4pjz3o32e.cloudfront.net/cta-image.svg"
              alt="Students collaborating"
              width={500}
              height={500}
              objectFit="contain"
            />
          </MotionBox>
        )}
      </Flex>
    </Box>
  );
};

export default CtaSection;

/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Box, Button, Flex, Grid, Heading, Text } from "@chakra-ui/react";
import { motion } from "framer-motion";
import React from "react";
import { RxChevronRight } from "react-icons/rx";
import { FiTarget, FiUsers, FiAward, FiGlobe, FiBookOpen, FiHeart } from "react-icons/fi";
import { useRouter } from "next/navigation";

const MotionBox = motion(Box);
const MotionHeading = motion(Heading);
const MotionFlex = motion(Flex);

const Objectives = () => {
  const router = useRouter();
  
  const objectives = [
    {
      icon: <FiTarget size={28} />,
      title: "Skill Development",
      description: "Equip African teens with digital and soft skills needed for the modern workforce.",
      color: "primary.500",
      delay: 0.1,
    },
    {
      icon: <FiUsers size={28} />,
      title: "Mentorship Access",
      description: "Connect teens with experienced mentors who provide guidance and support.",
      color: "secondary.600",
      delay: 0.2,
    },
    {
      icon: <FiAward size={28} />,
      title: "Leadership Training",
      description: "Develop the next generation of confident, ethical African leaders.",
      color: "primary.500",
      delay: 0.3,
    },
    {
      icon: <FiGlobe size={28} />,
      title: "Global Exposure",
      description: "Provide opportunities for teens to engage with global platforms and networks.",
      color: "secondary.600",
      delay: 0.4,
    },
    {
      icon: <FiBookOpen size={28} />,
      title: "Educational Support",
      description: "Supplement formal education with practical, industry-relevant knowledge.",
      color: "primary.500",
      delay: 0.5,
    },
    {
      icon: <FiHeart size={28} />,
      title: "Community Building",
      description: "Foster a supportive community where teens can collaborate and grow together.",
      color: "secondary.600",
      delay: 0.6,
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: (delay: any) => ({
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 12,
        delay: delay,
      },
    }),
  };

  return (
    <Box
      as="section"
      py={{ base: 16, md: 24 }}
      px="5%"
      bg="gray.50"
    >
      <MotionFlex
        direction="column"
        maxW="container.xl"
        mx="auto"
        initial={false}
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={containerVariants}
      >
        {/* Header Section */}
        <Flex
          direction={{ base: "column", md: "row" }}
          justify="space-between"
          align={{ base: "flex-start", md: "flex-end" }}
          mb={{ base: 12, md: 16 }}
          gap={{ base: 6, md: 12 }}
        >
          <Box maxW={{ base: "100%", md: "50%" }}>
            <MotionBox
              initial={false}
              whileInView={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <Text fontWeight="semibold" color="primary.600" mb={3}>
                Our Mission
              </Text>
            </MotionBox>
            <MotionHeading
              size={{ base: "xl", md: "2xl" }}
              lineHeight="1.2"
              mb={4}
              initial={false}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              GrowTeens Strategic Objectives
            </MotionHeading>
          </Box>
          
          <MotionBox
            maxW={{ base: "100%", md: "50%" }}
            initial={false}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <Text fontSize={{ base: "md", md: "lg" }} color="gray.700">
              Our objectives are centered on creating holistic development opportunities
              for African teenagers, preparing them to thrive in an increasingly 
              digital global economy while maintaining strong community ties.
            </Text>
          </MotionBox>
        </Flex>

        {/* Objectives Grid */}
        <Grid
          templateColumns={{ base: "1fr", md: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" }}
          gap={{ base: 8, md: 6, lg: 8 }}
          mb={{ base: 12, md: 16 }}
        >
          {objectives.map((objective, index) => (
            <MotionBox
              key={index}
              p={6}
              borderRadius="xl"
              bg="white"
              boxShadow="md"
              borderTop="4px solid"
              borderColor={objective.color}
              height="100%"
              position="relative"
              overflow="hidden"
              custom={objective.delay}
              variants={itemVariants}
              whileHover={{ 
                y: -5,
                boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
                transition: { duration: 0.2 }
              }}
            >
              <Flex 
                align="center" 
                justify="center" 
                h="52px" 
                w="52px" 
                borderRadius="full" 
                bg={`${objective.color}10`}
                color={objective.color}
                mb={4}
              >
                {objective.icon}
              </Flex>
              
              <Text
                fontWeight="700"
                fontSize={{ base: "xl", md: "xl", lg: "2xl" }}
                mb={3}
                color="gray.800"
              >
                {objective.title}
              </Text>
              
              <Text color="gray.600" fontSize="md">
                {objective.description}
              </Text>
              
              {/* Decorative element - small circle in bottom right */}
              <Box
                position="absolute"
                bottom="-10px"
                right="-10px"
                h="50px"
                w="50px"
                borderRadius="full"
                bg={`${objective.color}15`}
                zIndex="0"
              />
            </MotionBox>
          ))}
        </Grid>

        {/* Call to Action */}
        <MotionFlex
          justify={{ base: "center", md: "flex-start" }}
          mt={{ base: 6, md: 8 }}
          gap={4}
          initial={false}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.5 }}
        >
          <Button 
            colorScheme="primary" 
            size="lg" 
            onClick={() => router.push("/about")}
          >
            Learn More About Us
          </Button>
          <Button 
            variant="outline" 
            colorScheme="primary" 
            size="lg"
            rightIcon={<RxChevronRight />}
            onClick={() => router.push("/auth/signup")}
          >
            Join Our Program
          </Button>
        </MotionFlex>
      </MotionFlex>
    </Box>
  );
};

export default Objectives;
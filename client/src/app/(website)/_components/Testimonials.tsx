"use client";

import React, { useState } from "react";
import { Box, Flex, Heading, IconButton, Text, Avatar, Stack, useBreakpointValue } from "@chakra-ui/react";
import { motion } from "framer-motion";
import { IoChevronBack, IoChevronForward } from "react-icons/io5";
import { FaQuoteLeft } from "react-icons/fa";

const MotionBox = motion(Box);

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
    quote: "GrowTeens changed my life. I learned web development skills that helped me secure a freelance job while still in school. The mentors truly care about our success.",
    name: "Adewale Johnson",
    title: "Digital Skills Graduate, Lagos",
    avatarUrl: "https://images.unsplash.com/photo-1507152832244-10d45c7eda57?q=80&w=200&auto=format&fit=crop",
  },
  {
    id: 2,
    quote: "The entrepreneurship program gave me the confidence to start my own small business. From idea validation to pitching, they covered everything I needed to know.",
    name: "Sarah Mensah",
    title: "Entrepreneur, Accra",
    avatarUrl: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?q=80&w=200&auto=format&fit=crop",
  },
  {
    id: 3,
    quote: "I never thought I could be a leader until I joined the leadership program. Now I'm running a community initiative in my neighborhood with skills I learned from GrowTeens.",
    name: "Emmanuel Okafor",
    title: "Leadership Program Alum, Abuja",
    avatarUrl: "https://images.unsplash.com/photo-1463453091185-61582044d556?q=80&w=200&auto=format&fit=crop",
  },
  {
    id: 4,
    quote: "The mentorship I received opened doors I never knew existed. My mentor helped me navigate educational opportunities and scholarship applications successfully.",
    name: "Fatima Ahmed",
    title: "University Student, Cairo",
    avatarUrl: "https://images.unsplash.com/photo-1619970096024-c99f1dd43905?q=80&w=200&auto=format&fit=crop",
  },
];

const Testimonials = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const isMobile = useBreakpointValue({ base: true, md: false });
  
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
  
  return (
    <Box 
      as="section" 
      py={{ base: 16, md: 24 }}
      bg="primary.500"
      position="relative"
      overflow="hidden"
    >
      {/* Decorative elements */}
      <Box
        position="absolute"
        top="-5%"
        left="-10%"
        width="300px"
        height="300px"
        borderRadius="full"
        bg="whiteAlpha.100"
      />
      <Box
        position="absolute"
        bottom="-10%"
        right="-5%"
        width="250px"
        height="250px"
        borderRadius="full"
        bg="whiteAlpha.100"
      />
      
      <Box maxW="container.xl" mx="auto" px="5%" position="relative" zIndex="2">
        <Flex
          direction="column"
          align="center"
          textAlign="center"
          mb={{ base: 12, md: 16 }}
        >
          <MotionBox
            initial={false}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <Text 
              color="yellow.300" 
              fontWeight="semibold" 
              mb={3}
            >
              Success Stories
            </Text>
          </MotionBox>
          <MotionBox
            initial={false}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <Heading 
              size={{ base: "xl", md: "2xl" }}
              color="white"
              maxW="3xl"
              mb={4}
            >
              Hear from the teens we&apos;ve empowered
            </Heading> 
          </MotionBox>
        </Flex>
        
        <Flex direction="column" align="center">
          <MotionBox
            key={testimonials[currentIndex].id}
            initial={false}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.4 }}
            maxW="4xl"
            mx="auto"
            textAlign="center"
            mb={10}
          >
            <Box 
              color="yellow.300" 
              fontSize="4xl" 
              mb={6}
              display="flex"
              justifyContent="center"
            >
              <FaQuoteLeft />
            </Box>
            <Text
              fontSize={{ base: "xl", md: "2xl" }}
              fontWeight="medium"
              color="white"
              lineHeight="1.6"
              mb={8}
            >
              {testimonials[currentIndex].quote}
            </Text>
            <Stack 
              direction={{ base: "column", sm: "row" }} 
              spacing={4} 
              justify="center"
              align="center"
            >
              <Avatar 
                size="lg" 
                src={testimonials[currentIndex].avatarUrl}
                name={testimonials[currentIndex].name}
                border="3px solid"
                borderColor="yellow.300"
              />
              <Box textAlign={{ base: "center", sm: "left" }}>
                <Text fontWeight="bold" color="white">
                  {testimonials[currentIndex].name}
                </Text>
                <Text color="whiteAlpha.800">
                  {testimonials[currentIndex].title}
                </Text>
              </Box>
            </Stack>
          </MotionBox>
          
          <Flex justify="center" align="center" mt={4}>
            <IconButton
              aria-label="Previous testimonial"
              icon={<IoChevronBack size={20} />}
              onClick={handlePrev}
              colorScheme="whiteAlpha"
              variant="ghost"
              size={isMobile ? "md" : "lg"}
              mx={2}
            />
            
            {/* Pagination dots */}
            <Flex mx={4}>
              {testimonials.map((_, index) => (
                <Box
                  key={index}
                  w={2}
                  h={2}
                  borderRadius="full"
                  bg={index === currentIndex ? "yellow.300" : "whiteAlpha.400"}
                  mx={1}
                  cursor="pointer"
                  onClick={() => setCurrentIndex(index)}
                />
              ))}
            </Flex>
            
            <IconButton
              aria-label="Next testimonial"
              icon={<IoChevronForward size={20} />}
              onClick={handleNext}
              colorScheme="whiteAlpha"
              variant="ghost"
              size={isMobile ? "md" : "lg"}
              mx={2}
            />
          </Flex>
        </Flex>
      </Box>
    </Box>
  );
};

export default Testimonials;
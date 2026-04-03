"use client";

import { Box, Button, Flex, Heading, Image, Link, SimpleGrid, Text } from "@chakra-ui/react";
import { motion } from "framer-motion";
import React from "react";
import { RxChevronRight } from "react-icons/rx";
import { useRouter } from "next/navigation";

const MotionBox = motion(Box);
const MotionFlex = motion(Flex);

interface ProgramProps {
  id: number;
  title: string;
  description: string;
  image: string;
  link: string;
}

const programs: ProgramProps[] = [
  {
    id: 1,
    title: "Digital Skills Academy",
    description: "Comprehensive training in web development, design, and digital marketing for teens aged 13-18.",
    image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=500&auto=format&fit=crop",
    link: "/programs/digital-skills",
  },
  {
    id: 2,
    title: "Youth Entrepreneurship",
    description: "Guidance and resources to help teens develop and launch their own business ideas.",
    image: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=500&auto=format&fit=crop",
    link: "/programs/entrepreneurship",
  },
  {
    id: 3,
    title: "Mentorship Program",
    description: "Connect with industry professionals who provide guidance and career advice.",
    image: "https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?q=80&w=500&auto=format&fit=crop",
    link: "/programs/mentorship",
  },
  {
    id: 4,
    title: "Leadership Development",
    description: "Workshops and activities designed to build confidence and leadership skills.",
    image: "https://images.unsplash.com/photo-1538805060514-97d9cc17730c?q=80&w=500&auto=format&fit=crop",
    link: "/programs/leadership",
  },
];

const Programs = () => {
  const router = useRouter();
  
  return (
    <Box 
      as="section" 
      py={{ base: 16, md: 24 }} 
      px="5%"
    >
      <Box maxW="container.xl" mx="auto">
        <MotionFlex
          direction={{ base: "column", lg: "row" }}
          justify="space-between"
          align={{ base: "flex-start", lg: "flex-end" }}
          mb={{ base: 10, md: 14 }}
          initial={false}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <Box maxW={{ lg: "60%" }}>
            <Text 
              color="primary.600" 
              fontWeight="semibold" 
              mb={3}
            >
              Our Programs
            </Text>
            <Heading 
              size={{ base: "xl", md: "2xl" }}
              mb={4}
            >
              Comprehensive initiatives designed for teen development
            </Heading>
            <Text fontSize={{ base: "md", md: "lg" }} color="gray.600" maxW="3xl">
              Our programs are structured to provide African teenagers with both theoretical knowledge
              and practical skills that prepare them for future success.
            </Text>
          </Box>
          
          <Link 
            href="/programs" 
            mt={{ base: 6, lg: 0 }}
            color="primary.500"
            fontWeight="medium"
            display="flex"
            alignItems="center"
            _hover={{ textDecoration: "none", color: "primary.600" }}
          >
            View all programs 
            <Box as="span" ml={1}>
              <RxChevronRight />
            </Box>
          </Link>
        </MotionFlex>
        
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={{ base: 8, md: 10 }}>
          {programs.map((program, index) => (
            <MotionBox
              key={program.id}
              borderRadius="xl"
              overflow="hidden"
              bg="white"
              boxShadow="md"
              height="100%"
              initial={false}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ 
                y: -5,
                transition: { duration: 0.2 },
                boxShadow: "lg"
              }}
            >
              <Box position="relative" height="240px">
                <Image
                  src={program.image}
                  alt={program.title}
                  objectFit="cover"
                  width="100%"
                  height="100%"
                />
                <Box 
                  position="absolute" 
                  inset="0" 
                  bgGradient="linear(to-t, blackAlpha.600, transparent)"
                />
              </Box>
              
              <Box p={6}>
                <Heading 
                  as="h3" 
                  size="lg" 
                  mb={3}
                  color="gray.800"
                >
                  {program.title}
                </Heading>
                <Text mb={5} color="gray.600">
                  {program.description}
                </Text>
                <Button
                  variant="link"
                  color="primary.500"
                  rightIcon={<RxChevronRight />}
                  onClick={() => router.push(program.link)}
                  _hover={{ color: "primary.600" }}
                >
                  Learn More
                </Button>
              </Box>
            </MotionBox>
          ))}
        </SimpleGrid>
        
        <MotionFlex
          justify="center"
          mt={{ base: 10, md: 14 }}
          initial={false}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
        >
          <Button 
            size="lg" 
            colorScheme="primary"
            onClick={() => router.push("/programs")}
          >
            Explore All Programs
          </Button>
        </MotionFlex>
      </Box>
    </Box>
  );
};

export default Programs;
"use client";

import { Box, Button, Flex, Grid, Heading, Image, Text } from "@chakra-ui/react";
import { motion } from "framer-motion";
import React from "react";
import { RxChevronRight } from "react-icons/rx";
import { useRouter } from "next/navigation";

const MotionBox = motion(Box);
const MotionFlex = motion(Flex);

// Replace these with actual partner logos
const partners = [
  { id: 1, name: "Microsoft", logo: "https://via.placeholder.com/150x80?text=Microsoft" },
  { id: 2, name: "Google", logo: "https://via.placeholder.com/150x80?text=Google" },
  { id: 3, name: "UNICEF", logo: "https://via.placeholder.com/150x80?text=UNICEF" },
  { id: 4, name: "African Development Bank", logo: "https://via.placeholder.com/150x80?text=AfDB" },
  { id: 5, name: "UNESCO", logo: "https://via.placeholder.com/150x80?text=UNESCO" },
  { id: 6, name: "MTN Foundation", logo: "https://via.placeholder.com/150x80?text=MTN" },
];

const Partners = () => {
  const router = useRouter();
  
  return (
    <Box
      as="section"
      py={{ base: 16, md: 20 }}
      bg="gray.50"
      px="5%"
    >
      <Box maxW="container.xl" mx="auto">
        <MotionFlex
          direction={{ base: "column", md: "row" }}
          justify="space-between"
          align={{ base: "flex-start", md: "flex-end" }}
          mb={{ base: 12, md: 16 }}
          initial={false}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <Box maxW={{ md: "60%" }}>
            <Text 
              color="primary.600" 
              fontWeight="semibold" 
              mb={3}
            >
              Our Network
            </Text>
            <Heading 
              size={{ base: "xl", md: "2xl" }}
              mb={4}
            >
              Partnering with global leaders to empower Africa&apos;s youth
            </Heading>
            <Text fontSize={{ base: "md", md: "lg" }} color="gray.600">
              We collaborate with organizations that share our vision of creating
              opportunities for African teenagers and building a brighter future.
            </Text>
          </Box>
        </MotionFlex>
        
        <Grid 
          templateColumns={{ base: "repeat(2, 1fr)", md: "repeat(3, 1fr)", lg: "repeat(6, 1fr)" }}
          gap={8}
          mb={{ base: 12, md: 16 }}
          alignItems="center"
        >
          {partners.map((partner, index) => (
            <MotionBox
              key={partner.id}
              bg="white"
              py={6}
              px={4}
              borderRadius="md"
              boxShadow="sm"
              display="flex"
              alignItems="center"
              justifyContent="center"
              height="100px"
              initial={false}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ 
                y: -5,
                boxShadow: "md",
                transition: { duration: 0.2 }
              }}
            >
              <Image 
                src={partner.logo} 
                alt={partner.name} 
                maxW="90%" 
                maxH="80%" 
              />
            </MotionBox>
          ))}
        </Grid>
        
        <MotionBox
          bg="primary.50"
          borderRadius="xl"
          p={{ base: 6, md: 10 }}
          boxShadow="md"
          initial={false}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
        >
          <Flex 
            direction={{ base: "column", md: "row" }}
            align={{ base: "flex-start", md: "center" }}
            justify="space-between"
          >
            <Box mb={{ base: 6, md: 0 }} maxW={{ md: "60%" }}>
              <Heading 
                as="h3" 
                size={{ base: "lg", md: "xl" }}
                mb={3}
              >
                Become a partner or sponsor
              </Heading>
              <Text color="gray.600">
                Join our mission to empower Africa&apos;s future leaders. Together, we can create
                meaningful impact and sustainable change across the continent.
              </Text>
            </Box>
            
            <Flex gap={4} flexWrap={{ base: "wrap", md: "nowrap" }}>
              <Button 
                colorScheme="primary"
                size="lg"
                onClick={() => router.push("/sponsor")}
              >
                Become a Sponsor
              </Button>
              <Button 
                variant="outline"
                colorScheme="primary"
                size="lg"
                rightIcon={<RxChevronRight />}
                onClick={() => router.push("/partners")}
              >
                Learn More
              </Button>
            </Flex>
          </Flex>
        </MotionBox>
      </Box>
    </Box>
  );
};

export default Partners;
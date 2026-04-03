"use client";

import React, { useState } from "react";
import {
  Box,
  Button,
  Container,
  Flex,
  FormControl,
  Heading,
  Input,
  Text,
  useToast,
  chakra,
  shouldForwardProp,
} from "@chakra-ui/react";
import { motion, isValidMotionProp } from "framer-motion";
import { FiSend } from "react-icons/fi";

// Create motion components
const MotionBox = chakra(motion.div, {
  shouldForwardProp: (prop) => isValidMotionProp(prop) || shouldForwardProp(prop),
});

const Newsletter = () => {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const toast = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast({
        title: "Email is required",
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "top",
      });
      return;
    }

    setIsSubmitting(true);
    
    // Simulate API call - replace with your actual newsletter subscription logic
    setTimeout(() => {
      toast({
        title: "Thank you for subscribing!",
        description: "You've been added to our newsletter.",
        status: "success",
        duration: 5000,
        isClosable: true,
        position: "top",
      });
      setEmail("");
      setIsSubmitting(false);
    }, 1500);
  };

  return (
    <Box 
      as="section" 
      py={{ base: 12, md: 20 }}
      bg="primary.600"
      color="white"
      position="relative"
      overflow="hidden"
    >
      {/* Decorative elements */}
      <MotionBox
        position="absolute"
        top="-80px"
        left="10%"
        w="200px"
        h="200px"
        borderRadius="full"
        bg="white"
        opacity={0.05}
        initial={false}
        whileInView={{ scale: 1, opacity: 0.05 }}
        // transition={{ duration: 1.2 }}
      />
      <MotionBox
        position="absolute"
        bottom="-120px"
        right="5%"
        w="300px"
        h="300px"
        borderRadius="full"
        bg="white"
        opacity={0.07}
        initial={false}
        whileInView={{ scale: 1, opacity: 0.07 }}
        // transition={{ duration: 1.5, delay: 0.2 }}
      />

      <Container maxW="container.lg" position="relative" zIndex={1}>
        <Flex 
          direction={{ base: "column", md: "row" }} 
          justify="space-between"
          align={{ base: "center", md: "flex-start" }}
          gap={{ base: 8, md: 12 }}
        >
          <MotionBox
            maxW={{ base: "100%", md: "50%" }}
            textAlign={{ base: "center", md: "left" }}
            initial={false}
            whileInView={{ opacity: 1, y: 0 }}
            // transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <Heading 
              as="h2" 
              size={{ base: "xl", md: "2xl" }}
              lineHeight="1.2" 
              mb={4}
            >
              Stay Updated with Our Latest Programs
            </Heading>
            <Text fontSize={{ base: "md", md: "lg" }} opacity={0.9} mb={6}>
              Join our newsletter to receive updates on upcoming trainings, mentorship opportunities, 
              and success stories from GrowTeens across Africa.
            </Text>
          </MotionBox>

          <MotionBox
            w={{ base: "100%", md: "45%" }}
            initial={false}
            whileInView={{ opacity: 1, y: 0 }}
            // transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <Box 
              bg="white" 
              p={{ base: 6, md: 8 }} 
              borderRadius="xl"
              boxShadow="0 10px 30px rgba(0,0,0,0.1)"
            >
              <form onSubmit={handleSubmit}>
                <Text fontWeight="medium" mb={4} color="gray.700">
                  Subscribe to our newsletter
                </Text>
                <FormControl mb={4}>
                  <Input
                    placeholder="Your email address"
                    _placeholder={{ color: "gray.400" }}
                    size="lg"
                    color="gray.800"
                    bg="gray.50"
                    border="1px solid"
                    borderColor="gray.200"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    _focus={{
                      boxShadow: "outline",
                      borderColor: "primary.500",
                    }}
                  />
                </FormControl>
                <Button
                  type="submit"
                  colorScheme="primary"
                  size="lg"
                  width="full"
                  leftIcon={<FiSend />}
                  isLoading={isSubmitting}
                  loadingText="Submitting"
                  _hover={{
                    transform: "translateY(-2px)",
                    boxShadow: "lg",
                  }}
                  transition="all 0.2s"
                >
                  Subscribe
                </Button>
              </form>
            </Box>
          </MotionBox>
        </Flex>
      </Container>
    </Box>
  );
};

export default Newsletter;
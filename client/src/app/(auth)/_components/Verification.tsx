/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
  Box,
  Heading,
  Text,
  Button,
  Icon,
  VStack,
  Container,
  Card,
  CardBody,
  Flex,
  useColorModeValue,
  Spinner,
} from "@chakra-ui/react";
import { FiCheck, FiX, FiAlertTriangle } from "react-icons/fi";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import requestClient from "@/lib/requestClient";

export default function Verification() {
  const [status, setStatus] = useState<
    "loading" | "success" | "expired" | "invalid" | "error"
  >("loading");
  const [email, setEmail] = useState<string>("");
  const searchParams = useSearchParams();
  const router = useRouter();
  const bgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");

  const token = searchParams?.get("token");

  const verify = useCallback(async () => {
    if (!token) {
      setStatus("invalid");
      return;
    }

    try {
      const response = await requestClient().get(`/auth/verify-email/${token}`);

      console.log("response", response);
      setStatus(response?.data?.status);
      if (response?.data?.email) {
        setEmail(response?.data?.email);
      }
    } catch (error: any) {
      if (error.response?.data?.status) {
        setStatus(error.response.data.status);
        console.log("error response", error, error.response.data.status);
      } else {
        setStatus("error");
      }
    }
  }, [token]);

  useEffect(() => {
    if (!token) {
      setStatus("invalid");
      return;
    }

    verify();
  }, [token, verify]);

  if (status === "loading") {
    return (
      <Container maxW="container.sm" py={10}>
        <Card
          bg={bgColor}
          borderWidth="1px"
          borderColor={borderColor}
          borderRadius="lg"
          overflow="hidden"
          boxShadow="md"
        >
          <CardBody p={8}>
            <VStack spacing={6} align="center">
              <Spinner size="xl" color="primary.500" thickness="4px" />
              <Heading size="lg" textAlign="center">
                Verifying your email...
              </Heading>
            </VStack>
          </CardBody>
        </Card>
      </Container>
    );
  }

  return (
    <Container maxW="container.sm" py={10}>
      <Card
        bg={bgColor}
        borderWidth="1px"
        borderColor={borderColor}
        borderRadius="lg"
        overflow="hidden"
        boxShadow="md"
      >
        <CardBody p={8}>
          <VStack spacing={6} align="center">
            {status === "success" && (
              <>
                <Box borderRadius="full" bg="green.100" p={3} color="green.500">
                  <Icon as={FiCheck} boxSize={8} />
                </Box>
                <Heading size="lg" textAlign="center">
                  Email Verified!
                </Heading>
                <Text fontSize="md" color="gray.600" textAlign="center">
                  Your email {email} has been successfully verified. You can now
                  log in to your account.
                </Text>
                <Button
                  colorScheme="primary"
                  size="lg"
                  width="full"
                  mt={4}
                  onClick={() => router.push("/auth/signin")}
                >
                  Log In
                </Button>
              </>
            )}

            {status === "expired" && (
              <>
                <Box
                  borderRadius="full"
                  bg="orange.100"
                  p={3}
                  color="orange.500"
                >
                  <Icon as={FiAlertTriangle} boxSize={8} />
                </Box>
                <Heading size="lg" textAlign="center">
                  Link Expired
                </Heading>
                <Text fontSize="md" color="gray.600" textAlign="center">
                  Your verification link has expired. Verification links are
                  valid for 10 minutes.
                </Text>
                <Button
                  colorScheme="primary"
                  size="lg"
                  width="full"
                  mt={4}
                  onClick={() => router.push("/auth/resend-verification")}
                >
                  Request New Link
                </Button>
              </>
            )}

            {(status === "error" || status === "invalid") && (
              <>
                <Box borderRadius="full" bg="red.100" p={3} color="red.500">
                  <Icon as={FiX} boxSize={8} />
                </Box>
                <Heading size="lg" textAlign="center">
                  Verification Failed
                </Heading>
                <Text fontSize="md" color="gray.600" textAlign="center">
                  There was a problem verifying your email. Please try again or
                  contact support.
                </Text>
                <Button
                  colorScheme="primary"
                  size="lg"
                  width="full"
                  mt={4}
                  onClick={() => router.push("/auth/resend-verification")}
                >
                  Try Again
                </Button>
              </>
            )}

            <Flex mt={4}>
              <Text fontSize="sm" color="gray.500">
                Need help?{" "}
                <Link href="/contact" passHref>
                  <Text as="span" color="primary.500">
                    Contact support
                  </Text>
                </Link>
              </Text>
            </Flex>
          </VStack>
        </CardBody>
      </Card>
    </Container>
  );
}

/* eslint-disable @next/next/no-html-link-for-pages */
"use client";

import React, { useState, useEffect } from "react";
import {
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Box,
  HStack,
  IconButton,
  Button,
  Link,
  Image,
  Container,
  Collapse,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverBody,
  PopoverArrow,
  useDisclosure,
  Stack,
} from "@chakra-ui/react";

import { RxHamburgerMenu, RxChevronDown } from "react-icons/rx";
import logo from "../../../../public/assets/images/logo.svg";
import { useRouter } from "next/navigation";

interface NavLink {
  name: string;
  href: string;
  children?: { name: string; href: string }[];
}

const navLinks: NavLink[] = [
  { name: "Home", href: "/" },
  { name: "About Us", href: "/#about" },
  {
    name: "Services",
    href: "/#services",
    children: [
      { name: "Courses", href: "/courses" },
      { name: "Mentors", href: "/mentors" },
      { name: "Programs", href: "/programs" },
    ],
  },
  {
    name: "Partners & Sponsors",
    href: "/partners",
    children: [
      { name: "Our Partners", href: "/partners" },
      { name: "Funding Opportunities", href: "/funding" },
      { name: "Become a Sponsor", href: "/sponsor" },
    ],
  },
];

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const { isOpen, onToggle } = useDisclosure();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const router = useRouter();

  return (
    <Box
      position="fixed"
      top="0"
      left="0"
      right="0"
      bg={isScrolled ? "white" : "transparent"}
      backdropFilter={isScrolled ? "blur(10px)" : "none"}
      zIndex="50"
      boxShadow={isScrolled ? "md" : "none"}
      transition="all 0.3s"
      width="100%"
    >
      <Container maxW="container.xl" py={2}>
        {/* Desktop View */}
        <Box
          className="flex justify-between items-center"
          py={2}
          px={{ base: 4, md: 6, lg: 8 }}
          display={{ base: "none", md: "flex" }}
        >
          {/* Logo */}
          <HStack className="h-16">
            <a href="/">
              <Image
                src={logo.src}
                alt="GrowTeens Logo"
                maxH="40px"
                width="auto"
              />
            </a>
          </HStack>

          {/* Navigation */}
          <HStack
            spacing={{ md: 4, lg: 8 }}
            color={isScrolled ? "gray.800" : "white"}
            fontSize={{ md: "sm", lg: "md" }}
            fontWeight="bold"
            alignItems="center"
            flex="1"
            justifyContent="center"
          >
            {navLinks.map((link) => (
              <Box key={link.name}>
                {link.children ? (
                  <Popover trigger="hover" placement="bottom-start">
                    <PopoverTrigger>
                      <Box
                        display="flex"
                        alignItems="center"
                        cursor="pointer"
                        px={2}
                      >
                        {link.name}
                        <Box ml={1} as="span">
                          <RxChevronDown />
                        </Box>
                      </Box>
                    </PopoverTrigger>
                    <PopoverContent
                      border={0}
                      boxShadow="xl"
                      bg="white"
                      p={4}
                      rounded="md"
                      minW="200px"
                    >
                      <PopoverArrow />
                      <PopoverBody p={0}>
                        <Stack>
                          {link.children.map((child) => (
                            <Link
                              key={child.name}
                              href={child.href}
                              px={3}
                              py={2}
                              borderRadius="md"
                              color="gray.800"
                            >
                              {child.name}
                            </Link>
                          ))}
                        </Stack>
                      </PopoverBody>
                    </PopoverContent>
                  </Popover>
                ) : (
                  <Link
                    href={link.href}
                    px={2}
                    _hover={{
                      textDecoration: "none",
                    }}
                  >
                    {link.name}
                  </Link>
                )}
              </Box>
            ))}
          </HStack>

          <HStack spacing={4}>
            <Button
              variant={"outline"}
              onClick={() => router.push("/auth/signin")}
              size={{ md: "sm", lg: "md" }}
              color={isScrolled ? "gray.800" : "white"}
              borderColor={isScrolled ? "gray.300" : "white"}
              _hover={{
                bg: isScrolled ? "gray.100" : "whiteAlpha.200",
                color: isScrolled ? "gray.800" : "white",
              }}
            >
              Sign in
            </Button>
            <Button
              colorScheme="yellow"
              onClick={() => router.push("/auth/signup")}
              size={{ md: "sm", lg: "md" }}
            >
              Join now
            </Button>
          </HStack>
        </Box>

        {/* Mobile View */}
        <Box
          className="flex justify-between items-center h-16"
          px={{ base: 4, sm: 6, lg: 8 }}
          display={{ base: "flex", md: "none" }}
        >
          {/* Logo */}
          <HStack>
            <a href="/">
              <Image
                src={logo.src}
                alt="GrowTeens Logo"
                maxH="40px"
                width="auto"
              />
            </a>
          </HStack>

          {/* Mobile Menu Button */}
          <IconButton
            aria-label="Toggle Menu"
            icon={<RxHamburgerMenu />}
            variant="ghost"
            onClick={onToggle}
            color={isScrolled ? "gray.800" : "white"}
            _hover={{ bg: isScrolled ? "gray.100" : "whiteAlpha.200" }}
          />
        </Box>
      </Container>

      {/* Mobile Menu Dropdown */}
      <Collapse in={isOpen} animateOpacity>
        <Box pb={4} display={{ md: "none" }} bg="white" boxShadow="lg">
          <Stack spacing={4} px={4} py={2}>
            {navLinks.map((link) => (
              <Box key={link.name}>
                {link.children ? (
                  <Menu>
                    <MenuButton
                      py={2}
                      w="full"
                      textAlign="left"
                      fontWeight="medium"
                      color="gray.800"
                    >
                      {link.name}
                      <Box ml={1} as="span" float="right">
                        <RxChevronDown />
                      </Box>
                    </MenuButton>
                    <MenuList>
                      {link.children.map((child) => (
                        <MenuItem
                          key={child.name}
                          as={Link}
                          href={child.href}
                          _hover={{
                            bg: "primary.50",
                            color: "primary.500",
                          }}
                        >
                          {child.name}
                        </MenuItem>
                      ))}
                    </MenuList>
                  </Menu>
                ) : (
                  <Link
                    href={link.href}
                    fontWeight="medium"
                    color="gray.800"
                    _hover={{
                      color: "primary.500",
                    }}
                  >
                    {link.name}
                  </Link>
                )}
              </Box>
            ))}
            <Box pt={2}>
              <Button
                colorScheme="primary"
                width="full"
                mb={2}
                onClick={() => router.push("/auth/signup")}
              >
                Join now
              </Button>
              <Button
                variant="outline"
                colorScheme="primary"
                width="full"
                onClick={() => router.push("/auth/signin")}
              >
                Sign in
              </Button>
            </Box>
          </Stack>
        </Box>
      </Collapse>
    </Box>
  );
}

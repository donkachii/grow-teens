import React from "react";
import {
  Box,
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  DrawerHeader,
  DrawerBody,
  DrawerFooter,
  Image,
  Flex,
  Heading,
  Text,
  HStack,
  VStack,
  SimpleGrid,
  Badge,
  Button,
  Icon,
  Avatar,
  useColorModeValue,
} from "@chakra-ui/react";
import {
  FiStar,
  FiClock,
  FiUser,
  FiPackage,
  FiEdit2,
} from "react-icons/fi";
import { Course } from "@/types";
import { convertDate } from "@/utils/formatDate";

interface DetailsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCourse: Course | null;
  handleEditCourse: (course: Course) => void;
}

const DetailsDrawer = ({
  isOpen,
  onClose,
  selectedCourse,
  handleEditCourse,
}: DetailsDrawerProps) => {

  const textColor = useColorModeValue("gray.800", "white");
  const mutedTextColor = useColorModeValue("gray.500", "gray.400");

  const getDifficultyColor = (difficulty: string = "BEGINNER") => {
    switch (difficulty) {
      case "BEGINNER":
        return "green";
      case "INTERMEDIATE":
        return "blue";
      case "ADVANCED":
        return "purple";
      case "EXPERT":
        return "red";
      default:
        return "gray";
    }
  };

  return (
    <Drawer
      isOpen={isOpen}
      placement="right"
      onClose={onClose}
      size="md"
    >
      <DrawerOverlay />
      <DrawerContent>
        <DrawerCloseButton />

        {/* Header image */}
        <Box position="relative" height="180px">
          <Image
            src={
              selectedCourse?.thumbnail ||
              "https://via.placeholder.com/800x180?text=No+Cover+Image"
            }
            alt={selectedCourse?.title || "Course details"}
            objectFit="cover"
            w="100%"
            h="100%"
          />
          <Box
            position="absolute"
            bottom={0}
            left={0}
            right={0}
            height="50%"
            bgGradient="linear(to-t, blackAlpha.700, transparent)"
          />
        </Box>

        <DrawerHeader pt={5} pb={0}>
          <Flex justify="space-between" align="center">
            <Heading size="lg">{selectedCourse?.title}</Heading>
            <HStack>
              {selectedCourse?.isFeatured && (
                <Icon as={FiStar} color="yellow.400" boxSize={5} />
              )}
              <Badge
                colorScheme={selectedCourse?.isPublished ? "green" : "gray"}
                fontSize="sm"
                px={2}
                py={1}
              >
                {selectedCourse?.isPublished ? "Published" : "Draft"}
              </Badge>
            </HStack>
          </Flex>
        </DrawerHeader>

        <DrawerBody>
          <VStack align="stretch" spacing={6}>
            <Box>
              <Text fontWeight="medium" mb={1} color={textColor}>
                Description
              </Text>
              <Text color={mutedTextColor}>{selectedCourse?.description}</Text>
            </Box>

            <SimpleGrid columns={2} spacing={4}>
              <Box>
                <Text fontWeight="medium" mb={1} color={textColor}>
                  Category
                </Text>
                <Badge colorScheme="teal">
                  {selectedCourse?.category?.name || "N/A"}
                </Badge>
              </Box>

              <Box>
                <Text fontWeight="medium" mb={1} color={textColor}>
                  Difficulty
                </Text>
                <Badge
                  colorScheme={getDifficultyColor(selectedCourse?.difficulty)}
                >
                  {selectedCourse?.difficulty}
                </Badge>
              </Box>
            </SimpleGrid>

            <SimpleGrid columns={3} spacing={4}>
              <Box>
                <Text fontWeight="medium" mb={1} color={textColor}>
                  Duration
                </Text>
                <Flex align="center">
                  <Icon as={FiClock} color="orange.500" mr={1} />
                  <Text>{selectedCourse?.durationHours || 0} hours</Text>
                </Flex>
              </Box>

              <Box>
                <Text fontWeight="medium" mb={1} color={textColor}>
                  Enrollments
                </Text>
                <Flex align="center">
                  <Icon as={FiUser} color="blue.500" mr={1} />
                  <Text>{selectedCourse?._count?.enrollments || 0}</Text>
                </Flex>
              </Box>

              <Box>
                <Text fontWeight="medium" mb={1} color={textColor}>
                  Modules
                </Text>
                <Flex align="center">
                  <Icon as={FiPackage} color="purple.500" mr={1} />
                  <Text>{selectedCourse?._count?.modules || 0}</Text>
                </Flex>
              </Box>
            </SimpleGrid>

            {selectedCourse?.instructor && (
              <Box>
                <Text fontWeight="medium" mb={2} color={textColor}>
                  Instructor
                </Text>
                <Flex align="center">
                  <Avatar
                    size="md"
                    name={`${selectedCourse.instructor.firstName} ${selectedCourse.instructor.lastName}`}
                    src={selectedCourse.instructor.profileImage}
                    mr={3}
                  />
                  <Box>
                    <Text fontWeight="medium">
                      {selectedCourse.instructor.firstName}{" "}
                      {selectedCourse.instructor.lastName}
                    </Text>
                    <Text fontSize="sm" color={mutedTextColor}>
                      ID: {selectedCourse.instructor.id}
                    </Text>
                  </Box>
                </Flex>
              </Box>
            )}

            <Box>
              <Text fontWeight="medium" mb={1} color={textColor}>
                Created
              </Text>
              <Text color={mutedTextColor}>
                {convertDate(selectedCourse?.createdAt || "")}
              </Text>
            </Box>

            <Box>
              <Text fontWeight="medium" mb={1} color={textColor}>
                Last Updated
              </Text>
              <Text color={mutedTextColor}>
                {convertDate(selectedCourse?.updatedAt || "")}
              </Text>
            </Box>
          </VStack>
        </DrawerBody>

        <DrawerFooter borderTopWidth="1px">
          <Button
            variant="outline"
            colorScheme="gray"
            mr={3}
            onClick={onClose}
          >
            Close
          </Button>
          <Button
            colorScheme="blue"
            leftIcon={<FiEdit2 />}
            onClick={() => {
              onClose();
              if (selectedCourse) handleEditCourse(selectedCourse);
            }}
            isDisabled={!selectedCourse}
          >
            Edit Course
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};

export default DetailsDrawer;

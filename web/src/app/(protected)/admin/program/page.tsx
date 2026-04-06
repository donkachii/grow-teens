"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Badge,
  Box,
  Button,
  Divider,
  Flex,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Heading,
  IconButton,
  Image,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Select,
  Spinner,
  Stack,
  Switch,
  Table,
  Tbody,
  Td,
  Text,
  Textarea,
  Th,
  Thead,
  Tooltip,
  Tr,
  useDisclosure,
  useToast,
  HStack,
  VStack,
} from "@chakra-ui/react";
import { useForm, SubmitHandler } from "react-hook-form";
import { FiEdit2, FiPlus, FiTrash2, FiLayers } from "react-icons/fi";
import { IoCloudUploadOutline } from "react-icons/io5";
import { useSession } from "next-auth/react";

import { NextAuthUserSession } from "@/types";
import { handleServerErrorMessage } from "@/utils";
import {
  programService,
  courseService,
  Program,
} from "@/services/api";
import { Course } from "@/types";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

interface ProgramFormInputs {
  title: string;
  description: string;
  isPublished: boolean;
  image?: FileList;
}

const ProgramManagement = () => {
  const programModal = useDisclosure();
  const coursesModal = useDisclosure();

  const [programs, setPrograms] = useState<Program[]>([]);
  const [availableCourses, setAvailableCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [thumbnailPreview, setThumbnailPreview] = useState<string>("");

  // For the "manage courses" modal
  const [selectedCourseId, setSelectedCourseId] = useState<string>("");
  const [isAddingCourse, setIsAddingCourse] = useState(false);
  const [removingCourseId, setRemovingCourseId] = useState<number | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const toast = useToast();

  const { data: sessionData } = useSession() as { data: NextAuthUserSession | null };
  const token = sessionData?.user?.token;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProgramFormInputs>({ defaultValues: { isPublished: false } });

  const fetchPrograms = useCallback(async () => {
    if (!token) return;
    setIsLoading(true);
    setFetchError(null);
    try {
      const res = await programService.getPrograms(token);
      setPrograms((res as any)?.data?.data ?? []);
    } catch (err) {
      setFetchError(handleServerErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchPrograms();
  }, [fetchPrograms]);

  // Load available courses once for the assign-courses modal
  useEffect(() => {
    if (!token) return;
    courseService
      .getAdminCourses(token, { limit: 100 })
      .then((res) => setAvailableCourses((res as any)?.data?.data ?? []))
      .catch(() => {});
  }, [token]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_FILE_SIZE) {
      toast({ title: "File too large", description: "Max size is 10 MB.", status: "error" });
      return;
    }
    setThumbnailPreview(URL.createObjectURL(file));
  };

  const handleOpenCreate = () => {
    setIsEditMode(false);
    setSelectedProgram(null);
    setThumbnailPreview("");
    reset({ title: "", description: "", isPublished: false });
    programModal.onOpen();
  };

  const handleOpenEdit = (program: Program) => {
    setIsEditMode(true);
    setSelectedProgram(program);
    setThumbnailPreview(program.thumbnail || "");
    reset({
      title: program.title,
      description: program.description,
      isPublished: program.isPublished,
    });
    programModal.onOpen();
  };

  const handleOpenManageCourses = (program: Program) => {
    setSelectedProgram(program);
    setSelectedCourseId("");
    coursesModal.onOpen();
  };

  const onSubmit: SubmitHandler<ProgramFormInputs> = async (data) => {
    if (!token) return;
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("title", data.title);
      formData.append("description", data.description);
      formData.append("isPublished", data.isPublished ? "1" : "0");

      if (data.image?.[0]) {
        formData.append("image", data.image[0]);
      }

      if (isEditMode && selectedProgram) {
        await programService.updateProgram(token, selectedProgram.id, formData);
        toast({ title: "Program updated.", status: "success" });
      } else {
        await programService.createProgram(token, formData);
        toast({ title: "Program created.", status: "success" });
      }

      programModal.onClose();
      reset();
      setThumbnailPreview("");
      fetchPrograms();
    } catch (err) {
      toast({ title: "Error", description: handleServerErrorMessage(err), status: "error" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (program: Program) => {
    if (!token) return;
    if (!confirm(`Delete "${program.title}"? This cannot be undone.`)) return;
    try {
      await programService.deleteProgram(token, program.id);
      toast({ title: "Program deleted.", status: "success" });
      fetchPrograms();
    } catch (err) {
      toast({ title: "Error", description: handleServerErrorMessage(err), status: "error" });
    }
  };

  const handleAddCourse = async () => {
    if (!token || !selectedProgram || !selectedCourseId) return;
    setIsAddingCourse(true);
    try {
      const res = await programService.addCourse(token, selectedProgram.id, {
        courseId: +selectedCourseId,
      });
      // Update local state
      const link = (res as any)?.data;
      setSelectedProgram((prev) =>
        prev ? { ...prev, courses: [...prev.courses, link] } : prev
      );
      setPrograms((prev) =>
        prev.map((p) =>
          p.id === selectedProgram.id
            ? { ...p, courses: [...p.courses, link] }
            : p
        )
      );
      setSelectedCourseId("");
      toast({ title: "Course added to program.", status: "success", duration: 2000 });
    } catch (err) {
      toast({ title: "Error", description: handleServerErrorMessage(err), status: "error" });
    } finally {
      setIsAddingCourse(false);
    }
  };

  const handleRemoveCourse = async (courseId: number) => {
    if (!token || !selectedProgram) return;
    setRemovingCourseId(courseId);
    try {
      await programService.removeCourse(token, selectedProgram.id, courseId);
      const updated = selectedProgram.courses.filter((c) => c.course.id !== courseId);
      setSelectedProgram((prev) => (prev ? { ...prev, courses: updated } : prev));
      setPrograms((prev) =>
        prev.map((p) =>
          p.id === selectedProgram.id ? { ...p, courses: updated } : p
        )
      );
      toast({ title: "Course removed.", status: "success", duration: 2000 });
    } catch (err) {
      toast({ title: "Error", description: handleServerErrorMessage(err), status: "error" });
    } finally {
      setRemovingCourseId(null);
    }
  };

  // Courses not yet added to the selected program
  const unassignedCourses = availableCourses.filter(
    (c) => !selectedProgram?.courses.some((pc) => pc.course.id === c.id)
  );

  return (
    <Box p={6} bg="gray.50" minH="100vh">
      <Flex justifyContent="space-between" alignItems="center" mb={6}>
        <Heading size="lg">Program Management</Heading>
        <Button leftIcon={<FiPlus />} colorScheme="blue" onClick={handleOpenCreate}>
          Add New Program
        </Button>
      </Flex>

      <Divider mb={6} />

      {/* Program list */}
      <Box bg="white" p={6} borderRadius="md" boxShadow="sm">
        {isLoading ? (
          <Flex justify="center" py={10}>
            <Spinner size="lg" />
          </Flex>
        ) : fetchError ? (
          <Flex justify="center" direction="column" align="center" gap={4} py={10}>
            <Text color="red.500">{fetchError}</Text>
            <Button size="sm" onClick={fetchPrograms}>Try Again</Button>
          </Flex>
        ) : programs.length === 0 ? (
          <Text textAlign="center" color="gray.500" py={10}>
            No programs yet. Click &quot;Add New Program&quot; to get started.
          </Text>
        ) : (
          <Table variant="simple" size="sm">
            <Thead>
              <Tr>
                <Th>#</Th>
                <Th>Title</Th>
                <Th>Description</Th>
                <Th>Courses</Th>
                <Th>Status</Th>
                <Th>Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {programs.map((program, idx) => (
                <Tr key={program.id}>
                  <Td>{idx + 1}</Td>
                  <Td fontWeight="medium">{program.title}</Td>
                  <Td maxW="300px">
                    <Text noOfLines={2} fontSize="sm" color="gray.600">
                      {program.description}
                    </Text>
                  </Td>
                  <Td>
                    <Badge colorScheme="blue">{program.courses?.length ?? 0} courses</Badge>
                  </Td>
                  <Td>
                    <Badge colorScheme={program.isPublished ? "green" : "yellow"}>
                      {program.isPublished ? "Published" : "Draft"}
                    </Badge>
                  </Td>
                  <Td>
                    <HStack spacing={1}>
                      <Tooltip label="Manage Courses" hasArrow>
                        <IconButton
                          icon={<FiLayers />}
                          size="xs"
                          variant="ghost"
                          colorScheme="purple"
                          aria-label="Manage courses"
                          onClick={() => handleOpenManageCourses(program)}
                        />
                      </Tooltip>
                      <Tooltip label="Edit" hasArrow>
                        <IconButton
                          icon={<FiEdit2 />}
                          size="xs"
                          variant="ghost"
                          aria-label="Edit program"
                          onClick={() => handleOpenEdit(program)}
                        />
                      </Tooltip>
                      <Tooltip label="Delete" hasArrow>
                        <IconButton
                          icon={<FiTrash2 />}
                          size="xs"
                          variant="ghost"
                          colorScheme="red"
                          aria-label="Delete program"
                          onClick={() => handleDelete(program)}
                        />
                      </Tooltip>
                    </HStack>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        )}
      </Box>

      {/* Create / Edit Program Modal */}
      <Modal isOpen={programModal.isOpen} onClose={programModal.onClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{isEditMode ? "Edit Program" : "Add New Program"}</ModalHeader>
          <ModalCloseButton />
          <form onSubmit={handleSubmit(onSubmit)}>
            <ModalBody>
              <Stack spacing={4}>
                <FormControl isRequired isInvalid={!!errors.title}>
                  <FormLabel fontSize="sm">Title</FormLabel>
                  <Input
                    {...register("title", { required: "Title is required" })}
                    placeholder="Program title"
                    fontSize="sm"
                  />
                  <FormErrorMessage>{errors.title?.message}</FormErrorMessage>
                </FormControl>

                <FormControl isRequired isInvalid={!!errors.description}>
                  <FormLabel fontSize="sm">Description</FormLabel>
                  <Textarea
                    {...register("description", { required: "Description is required" })}
                    placeholder="What is this program about?"
                    fontSize="sm"
                    rows={3}
                  />
                  <FormErrorMessage>{errors.description?.message}</FormErrorMessage>
                </FormControl>

                <FormControl>
                  <FormLabel fontSize="sm">Thumbnail Image</FormLabel>
                  <Box
                    border="2px dashed"
                    borderColor="gray.200"
                    borderRadius="md"
                    p={4}
                    textAlign="center"
                    cursor="pointer"
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      const file = e.dataTransfer.files?.[0];
                      if (file) {
                        if (file.size > MAX_FILE_SIZE) {
                          toast({ title: "File too large", description: "Max 10 MB", status: "error" });
                          return;
                        }
                        setThumbnailPreview(URL.createObjectURL(file));
                        // manually set the files on the input isn't possible via dnd, just preview
                      }
                    }}
                  >
                    <input
                      type="file"
                      accept="image/*"
                      style={{ display: "none" }}
                      {...register("image")}
                      onChange={(e) => {
                        register("image").onChange(e);
                        handleFileChange(e);
                      }}
                    />
                    {thumbnailPreview ? (
                      <Image
                        src={thumbnailPreview}
                        alt="Thumbnail preview"
                        maxH="120px"
                        mx="auto"
                        borderRadius="md"
                        objectFit="cover"
                      />
                    ) : (
                      <VStack spacing={1} color="gray.400">
                        <IoCloudUploadOutline size={28} />
                        <Text fontSize="sm">
                          <Text as="span" fontWeight="semibold" color="blue.500">
                            Click to upload
                          </Text>{" "}
                          or drag and drop
                        </Text>
                        <Text fontSize="xs">PNG, JPG, WEBP — max 10 MB</Text>
                      </VStack>
                    )}
                  </Box>
                </FormControl>

                <FormControl display="flex" alignItems="center">
                  <FormLabel fontSize="sm" mb="0">Publish immediately?</FormLabel>
                  <Switch colorScheme="green" {...register("isPublished")} />
                </FormControl>
              </Stack>
            </ModalBody>
            <ModalFooter>
              <Button variant="ghost" mr={3} onClick={programModal.onClose} fontSize="sm">
                Cancel
              </Button>
              <Button
                type="submit"
                colorScheme="blue"
                isLoading={isSubmitting}
                leftIcon={isEditMode ? <FiEdit2 /> : <FiPlus />}
                fontSize="sm"
              >
                {isEditMode ? "Save Changes" : "Create Program"}
              </Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>

      {/* Manage Courses Modal */}
      <Modal isOpen={coursesModal.isOpen} onClose={coursesModal.onClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            Manage Courses — {selectedProgram?.title}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Stack spacing={4}>
              {/* Add course row */}
              <FormControl>
                <FormLabel fontSize="sm">Add a course</FormLabel>
                <HStack>
                  <Select
                    fontSize="sm"
                    placeholder="Select course…"
                    value={selectedCourseId}
                    onChange={(e) => setSelectedCourseId(e.target.value)}
                  >
                    {unassignedCourses.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.title}
                      </option>
                    ))}
                  </Select>
                  <Button
                    colorScheme="blue"
                    size="sm"
                    isDisabled={!selectedCourseId}
                    isLoading={isAddingCourse}
                    onClick={handleAddCourse}
                    flexShrink={0}
                  >
                    Add
                  </Button>
                </HStack>
              </FormControl>

              <Divider />

              {/* Current courses */}
              <Text fontSize="sm" fontWeight="semibold" color="gray.600">
                Courses in this program ({selectedProgram?.courses?.length ?? 0})
              </Text>
              {selectedProgram?.courses?.length === 0 ? (
                <Text fontSize="sm" color="gray.400" textAlign="center" py={4}>
                  No courses added yet.
                </Text>
              ) : (
                <Stack spacing={2}>
                  {[...(selectedProgram?.courses ?? [])]
                    .sort((a, b) => a.orderNumber - b.orderNumber)
                    .map((pc) => (
                      <Flex
                        key={pc.id}
                        align="center"
                        justify="space-between"
                        bg="gray.50"
                        borderRadius="md"
                        px={3}
                        py={2}
                      >
                        <HStack spacing={3}>
                          {pc.course.thumbnail && (
                            <Image
                              src={pc.course.thumbnail}
                              alt={pc.course.title}
                              boxSize="36px"
                              borderRadius="md"
                              objectFit="cover"
                            />
                          )}
                          <Box>
                            <Text fontSize="sm" fontWeight="medium">{pc.course.title}</Text>
                            <Text fontSize="xs" color="gray.400">Order: {pc.orderNumber}</Text>
                          </Box>
                        </HStack>
                        <IconButton
                          icon={<FiTrash2 />}
                          size="xs"
                          variant="ghost"
                          colorScheme="red"
                          aria-label="Remove course"
                          isLoading={removingCourseId === pc.course.id}
                          onClick={() => handleRemoveCourse(pc.course.id)}
                        />
                      </Flex>
                    ))}
                </Stack>
              )}
            </Stack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" onClick={coursesModal.onClose} fontSize="sm">
              Done
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default ProgramManagement;

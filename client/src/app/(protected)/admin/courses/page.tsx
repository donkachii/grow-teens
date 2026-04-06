"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  Button,
  Container,
  Flex,
  FormControl,
  FormLabel,
  Grid,
  Heading,
  Icon,
  Image,
  Input,
  InputGroup,
  InputLeftElement,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Select,
  SimpleGrid,
  Spinner,
  Stack,
  Tag,
  TagCloseButton,
  TagLabel,
  Text,
  Tooltip,
  useColorModeValue,
  useDisclosure,
  useToast,
  Badge,
  Divider,
  HStack,
  useBreakpointValue,
  IconButton,
  Switch,
  Wrap,
  WrapItem,
} from "@chakra-ui/react";
import {
  FiPlus,
  FiSearch,
  FiEdit2,
  FiTrash2,
  FiEye,
  FiStar,
  FiGrid,
  FiList,
  FiTag,
} from "react-icons/fi";
import { motion } from "framer-motion";
import DetailsDrawer from "./_components/DetailsDrawer";
import CourseFormModal from "./_components/CourseFormModal";
import DeleteConfirmationModal from "./_components/DeleteConfirmationModal";
import { Course, NextAuthUserSession } from "@/types";
import Pagination from "../../_components/Pagination";

import { courseService, categoryService, Category, AdminCourseListParams } from "@/services/api";
import { handleServerErrorMessage } from "@/utils";

import { useSession } from "next-auth/react";

const MotionBox = motion(Box);

interface CourseFormData {
  title: string;
  description: string;
  categoryId: number;
  difficulty: string;
  durationHours: number;
  instructorId: number;
  isFeatured: number;
  isPublished: number;
}

const AdminCoursesPage = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isToggling, setIsToggling] = useState<number | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [viewType, setViewType] = useState<"grid" | "list">("grid");

  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);

  const initialFormData: CourseFormData = {
    title: "",
    description: "",
    categoryId: 0,
    difficulty: "BEGINNER",
    durationHours: 0,
    instructorId: 0,
    isFeatured: 0,
    isPublished: 0,
  };
  const [formData, setFormData] = useState<CourseFormData>(initialFormData);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string>("");

  const toast = useToast();
  const courseFormModal = useDisclosure();
  const deleteConfirmation = useDisclosure();
  const detailsDrawer = useDisclosure();
  const categoryModal = useDisclosure();

  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryDesc, setNewCategoryDesc] = useState("");
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  const [deletingCategoryId, setDeletingCategoryId] = useState<number | null>(null);

  const cardBg = useColorModeValue("white", "gray.800");
  const cardHoverBg = useColorModeValue("gray.50", "gray.700");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const mutedTextColor = useColorModeValue("gray.500", "gray.400");

  const columns = useBreakpointValue({ base: 1, sm: 2, md: 3, lg: 4 }) || 4;

  const listVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  const { data: sessionData } = useSession() as {
    data: NextAuthUserSession | null;
  };
  const token = sessionData?.user?.token;

  const fetchCategories = useCallback(async () => {
    setCategoriesLoading(true);
    try {
      const res = await categoryService.getCategories();
      // GET /categories returns a plain array; Axios wraps it in res.data
      const list: Category[] = (res as any)?.data ?? [];
      setCategories(list);
    } catch {
      toast({ title: "Could not load categories", status: "warning", duration: 4000, isClosable: true });
    } finally {
      setCategoriesLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const fetchCourses = useCallback(
    async (page = 1) => {
      if (!token) return;

      setIsLoading(true);
      setCurrentPage(page);

      try {
        const params: AdminCourseListParams = {
          page: page,
          limit: 10,
        };
        if (searchQuery) params.search = searchQuery;
        if (categoryFilter) params.categoryId = categoryFilter;
        if (difficultyFilter) params.difficulty = difficultyFilter;

        if (statusFilter === "published") params.isPublished = true;
        else if (statusFilter === "draft") params.isPublished = false;
        else if (statusFilter === "featured") params.isFeatured = true;

        const response = await courseService.getAdminCourses(token, params);

        setCourses(response?.data?.data || []);
        setTotalPages(response?.data?.pagination?.totalPages || 1);
      } catch (err) {
        toast({
          title: "Error Fetching Courses",
          description: handleServerErrorMessage(err),
          status: "error",
          duration: 5000,
          isClosable: true,
        });
        setCourses([]);
        setTotalPages(1);
      } finally {
        setIsLoading(false);
      }
    },
    [token, searchQuery, categoryFilter, difficultyFilter, statusFilter]
  );

  useEffect(() => {
    if (token) {
      fetchCourses(1);
    }
  }, [fetchCourses, token]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  const handleFilterChange =
    (setter: React.Dispatch<React.SetStateAction<string>>) =>
    (event: React.ChangeEvent<HTMLSelectElement>) => {
      setter(event.target.value);
    };

  const handlePageChange = (newPage: number) => {
    fetchCourses(newPage);
  };

  const handleFormChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    const newValue =
      name === "durationHours" || name === "instructorId" || name === "categoryId"
        ? parseInt(value, 10) || 0
        : value;
    setFormData((prev) => ({ ...prev, [name]: newValue }));
  };

  const handleCheckboxChange = (name: string, checked: boolean) => {
    setFormData((prev) => ({ ...prev, [name]: checked ? 1 : 0 }));
  };

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "thumbnail"
  ) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setThumbnailFile(file);
      setThumbnailPreview(URL.createObjectURL(file));
    } else {
      setThumbnailFile(null);
      setThumbnailPreview("");
    }
  };

  const handleAddCourseClick = () => {
    setSelectedCourse(null);
    setIsEditMode(false);
    setFormData(initialFormData);
    setThumbnailFile(null);
    setThumbnailPreview("");
    courseFormModal.onOpen();
  };

  const handleEditCourseClick = (course: Course) => {
    setSelectedCourse(course);
    setIsEditMode(true);
    setFormData({
      title: course.title || "",
      description: course.description || "",
      categoryId: course.categoryId || 0,
      difficulty: course.difficulty || "BEGINNER",
      durationHours: course.durationHours || 0,
      instructorId: course.instructor?.id || 0,
      isFeatured: course.isFeatured ? 1 : 0,
      isPublished: course.isPublished ? 1 : 0,
    });
    setThumbnailFile(null);
    setThumbnailPreview(course.thumbnail || "");
    courseFormModal.onOpen();
  };

  const handleViewDetailsClick = (course: Course) => {
    setSelectedCourse(course);
    detailsDrawer.onOpen();
  };

  const handleDeleteClick = (course: Course) => {
    setSelectedCourse(course);
    deleteConfirmation.onOpen();
  };

  const handleCourseFormSubmit = async () => {
    if (!token) return;
    setIsSubmitting(true);

    const dataToSubmit = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (value === undefined || value === null) return;
      dataToSubmit.append(key, String(value));
    });

    if (thumbnailFile) {
      dataToSubmit.append("thumbnail", thumbnailFile);
    }

    try {
      if (isEditMode && selectedCourse) {
        await courseService.updateCourse(token, selectedCourse.id, dataToSubmit);
        toast({ title: "Success", description: "Course updated successfully.", status: "success" });
      } else {
        await courseService.createCourse(token, dataToSubmit);
        toast({ title: "Success", description: "Course created successfully.", status: "success" });
      }
      courseFormModal.onClose();
      fetchCourses(isEditMode ? currentPage : 1);
    } catch (err) {
      toast({ title: "Error", description: handleServerErrorMessage(err), status: "error" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedCourse || !token) return;
    setIsDeleting(true);
    try {
      await courseService.deleteCourse(token, selectedCourse.id);
      toast({ title: "Success", description: "Course deleted successfully.", status: "success" });
      deleteConfirmation.onClose();
      const newPage =
        courses.length === 1 && currentPage > 1 ? currentPage - 1 : currentPage;
      fetchCourses(newPage);
      setSelectedCourse(null);
    } catch (err) {
      toast({ title: "Error", description: handleServerErrorMessage(err), status: "error" });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleTogglePublish = async (course: Course) => {
    if (!token) return;
    setIsToggling(course.id);
    try {
      const updatedStatus = !course.isPublished;
      await courseService.togglePublish(token, course.id, { isPublished: updatedStatus });
      toast({
        title: "Success",
        description: `Course ${updatedStatus ? "published" : "unpublished"}.`,
        status: "success",
        duration: 3000,
      });
      fetchCourses(currentPage);
    } catch (err) {
      toast({ title: "Error", description: handleServerErrorMessage(err), status: "error" });
    } finally {
      setIsToggling(null);
    }
  };

  const handleCreateCategory = async () => {
    if (!token || !newCategoryName.trim()) return;

    const duplicate = categories.find(
      (c) => c.name.toLowerCase() === newCategoryName.trim().toLowerCase()
    );
    if (duplicate) {
      toast({ title: `"${duplicate.name}" already exists.`, status: "warning", duration: 3000 });
      return;
    }

    setIsCreatingCategory(true);
    try {
      await categoryService.createCategory(token, {
        name: newCategoryName.trim(),
        description: newCategoryDesc.trim() || undefined,
      });
      setNewCategoryName("");
      setNewCategoryDesc("");
      // Re-fetch to keep state in sync with server
      await fetchCategories();
      toast({ title: `"${newCategoryName.trim()}" added.`, status: "success", duration: 2000 });
    } catch (err) {
      toast({ title: "Error", description: handleServerErrorMessage(err), status: "error" });
    } finally {
      setIsCreatingCategory(false);
    }
  };

  const handleDeleteCategory = async (cat: Category) => {
    if (!token) return;
    setDeletingCategoryId(cat.id);
    try {
      await categoryService.deleteCategory(token, cat.id);
      await fetchCategories();
      toast({ title: `"${cat.name}" deleted.`, status: "success", duration: 2000 });
    } catch (err) {
      toast({ title: "Error", description: handleServerErrorMessage(err), status: "error" });
    } finally {
      setDeletingCategoryId(null);
    }
  };

  const getDifficultyColor = (difficulty: string = "BEGINNER") => {
    switch (difficulty?.toUpperCase()) {
      case "BEGINNER": return "green";
      case "INTERMEDIATE": return "orange";
      case "ADVANCED": return "red";
      case "EXPERT": return "purple";
      default: return "gray";
    }
  };

  const renderCourseGrid = () => (
    <MotionBox variants={listVariants} initial="hidden" animate="show">
      <SimpleGrid columns={columns} spacing={6}>
        {courses.map((course) => (
          <MotionBox
            key={course.id}
            variants={itemVariants}
            bg={cardBg}
            border="1px"
            borderColor={borderColor}
            borderRadius="lg"
            overflow="hidden"
            _hover={{ boxShadow: "md", bg: cardHoverBg, transform: "translateY(-2px)" }}
          >
            <Image
              src={course.thumbnail || "/placeholder-image.png"}
              alt={course.title}
              h="150px"
              w="full"
              objectFit="cover"
            />
            <Box p={4}>
              <HStack justify="space-between" align="start" mb={2}>
                <Heading size="sm" noOfLines={2}>{course.title}</Heading>
                <Badge colorScheme={course.isPublished ? "green" : "yellow"} fontSize="xs">
                  {course.isPublished ? "Published" : "Draft"}
                </Badge>
              </HStack>
              <Text fontSize="xs" color={mutedTextColor} mb={1}>
                Instructor: {course.instructor?.firstName} {course.instructor?.lastName || "N/A"}
              </Text>
              <HStack spacing={2} mb={2}>
                <Badge colorScheme={getDifficultyColor(course.difficulty || "BEGINNER")} fontSize="xs">
                  {course.difficulty || "BEGINNER"}
                </Badge>
                {course.category && (
                  <Badge colorScheme="blue" fontSize="xs">{course.category.name}</Badge>
                )}
                {course.isFeatured && (
                  <Badge colorScheme="purple" fontSize="xs">Featured</Badge>
                )}
              </HStack>
              <Text fontSize="sm" color={mutedTextColor} noOfLines={3} mb={3}>
                {course.description}
              </Text>
              <Divider my={3} />
              <Flex justify="space-between" align="center">
                <Tooltip label="Toggle Publish Status" hasArrow>
                  <Switch
                    colorScheme="green"
                    isChecked={course.isPublished}
                    onChange={() => handleTogglePublish(course)}
                    isDisabled={isToggling === course.id}
                    size="sm"
                  />
                </Tooltip>
                <HStack spacing={1}>
                  <Tooltip label="View Details" hasArrow>
                    <IconButton icon={<FiEye />} size="xs" variant="ghost" aria-label="View Details" onClick={() => handleViewDetailsClick(course)} />
                  </Tooltip>
                  <Tooltip label="Edit Course" hasArrow>
                    <IconButton icon={<FiEdit2 />} size="xs" variant="ghost" aria-label="Edit Course" onClick={() => handleEditCourseClick(course)} />
                  </Tooltip>
                  <Tooltip label="Delete Course" hasArrow>
                    <IconButton icon={<FiTrash2 />} size="xs" variant="ghost" colorScheme="red" aria-label="Delete Course" onClick={() => handleDeleteClick(course)} />
                  </Tooltip>
                </HStack>
              </Flex>
            </Box>
          </MotionBox>
        ))}
      </SimpleGrid>
    </MotionBox>
  );

  const renderCourseList = () => (
    <MotionBox
      variants={listVariants}
      initial="hidden"
      animate="show"
      borderWidth="1px"
      borderColor={borderColor}
      borderRadius="lg"
    >
      <Grid
        templateColumns="minmax(100px, 3fr) repeat(5, 1fr) auto"
        gap={4}
        p={4}
        borderBottomWidth="1px"
        borderColor={borderColor}
        alignItems="center"
        fontWeight="bold"
        fontSize="sm"
        color={mutedTextColor}
      >
        <Text>Title</Text>
        <Text>Instructor</Text>
        <Text>Category</Text>
        <Text>Difficulty</Text>
        <Text>Enrollments</Text>
        <Text>Status</Text>
        <Text>Actions</Text>
      </Grid>
      {courses.map((course) => (
        <MotionBox key={course.id} variants={itemVariants} _hover={{ bg: cardHoverBg }}>
          <Grid
            templateColumns="minmax(100px, 3fr) repeat(5, 1fr) auto"
            gap={4}
            p={4}
            borderBottomWidth="1px"
            borderColor={borderColor}
            alignItems="center"
            fontSize="sm"
          >
            <Tooltip label={course.title} placement="top-start" hasArrow>
              <Text fontWeight="medium" noOfLines={1}>{course.title}</Text>
            </Tooltip>
            <Text noOfLines={1}>
              {course.instructor?.firstName} {course.instructor?.lastName || "N/A"}
            </Text>
            <Text>
              <Badge colorScheme="blue" fontSize="xs">{course.category?.name || "N/A"}</Badge>
            </Text>
            <Text>
              <Badge colorScheme={getDifficultyColor(course.difficulty || "BEGINNER")} fontSize="xs">
                {course.difficulty || "BEGINNER"}
              </Badge>
            </Text>
            <Text>{course._count?.enrollments ?? 0}</Text>
            <Flex align="center">
              <Tooltip label={course.isPublished ? "Published" : "Draft"} hasArrow>
                <Switch
                  colorScheme="green"
                  isChecked={course.isPublished}
                  onChange={() => handleTogglePublish(course)}
                  isDisabled={isToggling === course.id}
                  size="sm"
                  mr={2}
                />
              </Tooltip>
              {course.isFeatured && <Icon as={FiStar} color="purple.500" title="Featured" />}
            </Flex>
            <HStack spacing={1} justifySelf="end">
              <Tooltip label="View Details" hasArrow>
                <IconButton icon={<FiEye />} size="xs" variant="ghost" aria-label="View Details" onClick={() => handleViewDetailsClick(course)} />
              </Tooltip>
              <Tooltip label="Edit Course" hasArrow>
                <IconButton icon={<FiEdit2 />} size="xs" variant="ghost" aria-label="Edit Course" onClick={() => handleEditCourseClick(course)} />
              </Tooltip>
              <Tooltip label="Delete Course" hasArrow>
                <IconButton icon={<FiTrash2 />} size="xs" variant="ghost" colorScheme="red" aria-label="Delete Course" onClick={() => handleDeleteClick(course)} />
              </Tooltip>
            </HStack>
          </Grid>
        </MotionBox>
      ))}
    </MotionBox>
  );

  return (
    <Container maxW="container.xl" py={8}>
      <Flex justify="space-between" align="center" mb={6} wrap="wrap" gap={4}>
        <Heading size="lg">Manage Courses</Heading>
        <HStack>
          <Button
            leftIcon={<FiTag />}
            variant="outline"
            size="sm"
            onClick={categoryModal.onOpen}
          >
            Manage Categories
          </Button>
          <Button leftIcon={<FiPlus />} colorScheme="blue" onClick={handleAddCourseClick}>
            Add New Course
          </Button>
        </HStack>
      </Flex>

      <SimpleGrid columns={{ base: 1, md: 2, lg: 5 }} spacing={4} mb={6}>
        <InputGroup size="sm">
          <InputLeftElement pointerEvents="none">
            <Icon as={FiSearch} color="gray.400" />
          </InputLeftElement>
          <Input
            placeholder="Search courses..."
            value={searchQuery}
            onChange={handleSearchChange}
            borderRadius="md"
          />
        </InputGroup>
        <Select
          placeholder="All Categories"
          size="sm"
          value={categoryFilter}
          onChange={handleFilterChange(setCategoryFilter)}
          borderRadius="md"
        >
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </Select>
        <Select
          placeholder="All Difficulties"
          size="sm"
          value={difficultyFilter}
          onChange={handleFilterChange(setDifficultyFilter)}
          borderRadius="md"
        >
          <option value="BEGINNER">Beginner</option>
          <option value="INTERMEDIATE">Intermediate</option>
          <option value="ADVANCED">Advanced</option>
          <option value="EXPERT">Expert</option>
        </Select>
        <Select
          placeholder="All Statuses"
          size="sm"
          value={statusFilter}
          onChange={handleFilterChange(setStatusFilter)}
          borderRadius="md"
        >
          <option value="published">Published</option>
          <option value="draft">Draft</option>
          <option value="featured">Featured</option>
        </Select>
        <HStack justify={{ base: "flex-start", lg: "flex-end" }}>
          <Tooltip label="Grid View" hasArrow>
            <IconButton
              icon={<FiGrid />}
              aria-label="Grid View"
              variant={viewType === "grid" ? "solid" : "ghost"}
              colorScheme={viewType === "grid" ? "blue" : "gray"}
              onClick={() => setViewType("grid")}
              size="sm"
            />
          </Tooltip>
          <Tooltip label="List View" hasArrow>
            <IconButton
              icon={<FiList />}
              aria-label="List View"
              variant={viewType === "list" ? "solid" : "ghost"}
              colorScheme={viewType === "list" ? "blue" : "gray"}
              onClick={() => setViewType("list")}
              size="sm"
            />
          </Tooltip>
        </HStack>
      </SimpleGrid>

      {isLoading ? (
        <Flex justify="center" align="center" minH="300px">
          <Spinner size="xl" />
        </Flex>
      ) : courses.length > 0 ? (
        <>
          {viewType === "grid" ? renderCourseGrid() : renderCourseList()}
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </>
      ) : (
        <Text textAlign="center" mt={10} color={mutedTextColor}>
          No courses found matching your criteria.
        </Text>
      )}

      <CourseFormModal
        isOpen={courseFormModal.isOpen}
        onClose={courseFormModal.onClose}
        formData={formData}
        categories={categories}
        categoriesLoading={categoriesLoading}
        handleFormChange={handleFormChange}
        handleCheckboxChange={handleCheckboxChange}
        handleFileChange={handleFileChange}
        handleSubmit={handleCourseFormSubmit}
        isLoading={isSubmitting}
        isEditMode={isEditMode}
        thumbnailPreview={thumbnailPreview}
      />

      <DeleteConfirmationModal
        isOpen={deleteConfirmation.isOpen}
        onClose={deleteConfirmation.onClose}
        handleDeleteCourse={handleConfirmDelete}
        selectedCourse={selectedCourse}
        isLoading={isDeleting}
      />

      <DetailsDrawer
        isOpen={detailsDrawer.isOpen}
        onClose={detailsDrawer.onClose}
        selectedCourse={selectedCourse}
        handleEditCourse={handleEditCourseClick}
      />

      {/* Manage Categories Modal */}
      <Modal isOpen={categoryModal.isOpen} onClose={categoryModal.onClose} size="md">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader fontSize="md">Manage Categories</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Stack spacing={5}>
              {/* Add new */}
              <Stack spacing={3}>
                <FormControl>
                  <FormLabel fontSize="sm">Category name</FormLabel>
                  <Input
                    fontSize="sm"
                    placeholder="e.g. Entrepreneurship"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") handleCreateCategory(); }}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel fontSize="sm">Description <Text as="span" color="gray.400" fontWeight="normal">(optional)</Text></FormLabel>
                  <Input
                    fontSize="sm"
                    placeholder="Short description"
                    value={newCategoryDesc}
                    onChange={(e) => setNewCategoryDesc(e.target.value)}
                  />
                </FormControl>
                <Button
                  leftIcon={<FiPlus />}
                  colorScheme="blue"
                  size="sm"
                  isDisabled={!newCategoryName.trim()}
                  isLoading={isCreatingCategory}
                  onClick={handleCreateCategory}
                >
                  Add Category
                </Button>
              </Stack>

              <Divider />

              {/* Existing categories */}
              <Box>
                <Text fontSize="sm" fontWeight="semibold" color="gray.500" mb={3}>
                  Existing categories ({categories.length})
                </Text>
                {categories.length === 0 ? (
                  <Text fontSize="sm" color="gray.400">None yet.</Text>
                ) : (
                  <Wrap spacing={2}>
                    {categories.map((cat) => (
                      <WrapItem key={cat.id}>
                        <Tag size="md" borderRadius="full" variant="subtle" colorScheme="blue">
                          <TagLabel>{cat.name}</TagLabel>
                          <TagCloseButton
                            isDisabled={deletingCategoryId === cat.id}
                            onClick={() => handleDeleteCategory(cat)}
                          />
                        </Tag>
                      </WrapItem>
                    ))}
                  </Wrap>
                )}
              </Box>
            </Stack>
          </ModalBody>
          <ModalFooter>
            <Button size="sm" variant="ghost" onClick={categoryModal.onClose}>Close</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Container>
  );
};

export default AdminCoursesPage;

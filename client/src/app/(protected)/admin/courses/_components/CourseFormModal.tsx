import React from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Button,
  Stack,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Select,
  SimpleGrid,
  Switch,
  Box,
  Image,
} from "@chakra-ui/react";
import { FiEdit2, FiPlus } from "react-icons/fi";
import { Category } from "@/services/api";

interface FormData {
  title: string;
  description: string;
  categoryId: number;
  difficulty: string;
  durationHours: number;
  instructorId: number;
  isFeatured: number;
  isPublished: number;
}

interface CourseFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  formData: FormData;
  categories: Category[];
  categoriesLoading?: boolean;
  handleFormChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => void;
  handleCheckboxChange: (name: string, value: boolean) => void;
  handleFileChange: (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "thumbnail"
  ) => void;
  handleSubmit: () => void;
  isLoading: boolean;
  isEditMode: boolean;
  thumbnailPreview: string;
}

const CourseFormModal: React.FC<CourseFormModalProps> = ({
  isOpen,
  onClose,
  formData,
  categories,
  categoriesLoading = false,
  handleFormChange,
  handleCheckboxChange,
  handleFileChange,
  handleSubmit,
  isLoading,
  isEditMode,
  thumbnailPreview,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          {isEditMode ? "Edit Course" : "Add New Course"}
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Stack spacing={4}>
            <FormControl isRequired>
              <FormLabel fontSize="sm">Course Title</FormLabel>
              <Input
                name="title"
                value={formData.title}
                onChange={handleFormChange}
                placeholder="Enter course title"
                fontSize="sm"
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel fontSize="sm">Description</FormLabel>
              <Textarea
                name="description"
                value={formData.description}
                onChange={handleFormChange}
                placeholder="Brief description of the course"
                fontSize="sm"
                rows={3}
              />
            </FormControl>

            <SimpleGrid columns={2} spacing={4}>
              <FormControl isRequired>
                <FormLabel fontSize="sm">Category</FormLabel>
                <Select
                  name="categoryId"
                  value={formData.categoryId || ""}
                  onChange={handleFormChange}
                  fontSize="sm"
                  placeholder={
                    categoriesLoading
                      ? "Loading categories…"
                      : categories.length === 0
                      ? "No categories available"
                      : "Select category"
                  }
                  isDisabled={categoriesLoading || categories.length === 0}
                >
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </Select>
              </FormControl>

              <FormControl isRequired>
                <FormLabel fontSize="sm">Difficulty Level</FormLabel>
                <Select
                  name="difficulty"
                  value={formData.difficulty}
                  onChange={handleFormChange}
                  fontSize="sm"
                >
                  <option value="BEGINNER">Beginner</option>
                  <option value="INTERMEDIATE">Intermediate</option>
                  <option value="ADVANCED">Advanced</option>
                  <option value="EXPERT">Expert</option>
                </Select>
              </FormControl>
            </SimpleGrid>

            <SimpleGrid columns={2} spacing={4}>
              <FormControl>
                <FormLabel fontSize="sm">Duration (Hours)</FormLabel>
                <Input
                  name="durationHours"
                  type="number"
                  value={formData.durationHours}
                  onChange={handleFormChange}
                  min={0}
                  fontSize="sm"
                />
              </FormControl>

              <FormControl>
                <FormLabel fontSize="sm">Instructor ID</FormLabel>
                <Input
                  name="instructorId"
                  type="number"
                  fontSize="sm"
                  value={formData.instructorId}
                  onChange={handleFormChange}
                  min={0}
                />
              </FormControl>
            </SimpleGrid>

            <FormControl>
              <FormLabel fontSize="sm">Thumbnail Image</FormLabel>
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => handleFileChange(e, "thumbnail")}
                fontSize="sm"
                p={1}
              />
              {thumbnailPreview && (
                <Box mt={2} position="relative" width="150px" height="100px">
                  <Image
                    src={thumbnailPreview}
                    alt="Thumbnail Preview"
                    objectFit="cover"
                    width="100%"
                    height="100%"
                    borderRadius="md"
                  />
                </Box>
              )}
            </FormControl>

            <SimpleGrid columns={2} spacing={4} mt={4}>
              <FormControl display="flex" alignItems="center">
                <FormLabel htmlFor="isPublished" mb="0" fontSize="sm">
                  Published?
                </FormLabel>
                <Switch
                  id="isPublished"
                  name="isPublished"
                  isChecked={formData.isPublished === 1}
                  onChange={(e) =>
                    handleCheckboxChange("isPublished", e.target.checked)
                  }
                />
              </FormControl>

              <FormControl display="flex" alignItems="center">
                <FormLabel htmlFor="isFeatured" mb="0" fontSize="sm">
                  Featured?
                </FormLabel>
                <Switch
                  id="isFeatured"
                  name="isFeatured"
                  isChecked={formData.isFeatured === 1}
                  onChange={(e) =>
                    handleCheckboxChange("isFeatured", e.target.checked)
                  }
                />
              </FormControl>
            </SimpleGrid>
          </Stack>
        </ModalBody>

        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={onClose} fontSize="sm">
            Cancel
          </Button>
          <Button
            colorScheme={isEditMode ? "blue" : "primary"}
            leftIcon={isEditMode ? <FiEdit2 /> : <FiPlus />}
            onClick={handleSubmit}
            isLoading={isLoading}
            fontSize="sm"
          >
            {isEditMode ? "Update Course" : "Create Course"}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default CourseFormModal;

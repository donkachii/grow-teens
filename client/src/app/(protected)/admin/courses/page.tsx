"use client";

import React, { useState, useEffect, useCallback } from "react";
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
import { toast } from "react-toastify";
import DetailsDrawer from "./_components/DetailsDrawer";
import CourseFormModal from "./_components/CourseFormModal";
import DeleteConfirmationModal from "./_components/DeleteConfirmationModal";
import { Modal } from "@/components/ui/Overlay";
import { Course, NextAuthUserSession } from "@/types";
import Pagination from "../../_components/Pagination";
import {
  courseService,
  categoryService,
  Category,
  AdminCourseListParams,
} from "@/services/api";
import { handleServerErrorMessage } from "@/utils";
import { useSession } from "next-auth/react";

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

const inputClassName =
  "w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500";

const buttonClassName =
  "inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60";

const viewButtonClassName = (active: boolean) =>
  `inline-flex h-10 w-10 items-center justify-center rounded-xl border transition ${
    active
      ? "border-blue-600 bg-blue-600 text-white"
      : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
  }`;

const difficultyClasses: Record<string, string> = {
  BEGINNER: "bg-emerald-100 text-emerald-700",
  INTERMEDIATE: "bg-amber-100 text-amber-700",
  ADVANCED: "bg-rose-100 text-rose-700",
  EXPERT: "bg-violet-100 text-violet-700",
};

const statusBadgeClass = (published?: boolean) =>
  published
    ? "bg-emerald-100 text-emerald-700"
    : "bg-amber-100 text-amber-700";

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
  const [isCourseFormOpen, setIsCourseFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);

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

  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryDesc, setNewCategoryDesc] = useState("");
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  const [deletingCategoryId, setDeletingCategoryId] = useState<number | null>(null);

  const { data: sessionData } = useSession() as {
    data: NextAuthUserSession | null;
  };
  const token = sessionData?.user?.token;

  const notify = (
    type: "success" | "error" | "warning",
    title: string,
    description?: string
  ) => {
    const message = description ? `${title}: ${description}` : title;
    if (type === "success") toast.success(message);
    else if (type === "error") toast.error(message);
    else toast.warning(message);
  };

  const fetchCategories = useCallback(async () => {
    setCategoriesLoading(true);
    try {
      const res = await categoryService.getCategories();
      const list: Category[] = (res as any)?.data ?? [];
      setCategories(list);
    } catch {
      notify("warning", "Could not load categories");
    } finally {
      setCategoriesLoading(false);
    }
  }, []);

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
          page,
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
        notify("error", "Error Fetching Courses", handleServerErrorMessage(err));
        setCourses([]);
        setTotalPages(1);
      } finally {
        setIsLoading(false);
      }
    },
    [token, searchQuery, categoryFilter, difficultyFilter, statusFilter]
  );

  useEffect(() => {
    if (token) fetchCourses(1);
  }, [fetchCourses, token]);

  const handleFormChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    const newValue =
      name === "durationHours" ||
      name === "instructorId" ||
      name === "categoryId"
        ? parseInt(value, 10) || 0
        : value;
    setFormData((prev) => ({ ...prev, [name]: newValue }));
  };

  const handleCheckboxChange = (name: string, checked: boolean) => {
    setFormData((prev) => ({ ...prev, [name]: checked ? 1 : 0 }));
  };

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    _type: "thumbnail"
  ) => {
    if (e.target.files?.[0]) {
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
    setIsCourseFormOpen(true);
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
    setIsCourseFormOpen(true);
  };

  const handleViewDetailsClick = (course: Course) => {
    setSelectedCourse(course);
    setIsDetailsOpen(true);
  };

  const handleDeleteClick = (course: Course) => {
    setSelectedCourse(course);
    setIsDeleteOpen(true);
  };

  const handleCourseFormSubmit = async () => {
    if (!token) return;
    setIsSubmitting(true);

    const dataToSubmit = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        dataToSubmit.append(key, String(value));
      }
    });

    if (thumbnailFile) dataToSubmit.append("thumbnail", thumbnailFile);

    try {
      if (isEditMode && selectedCourse) {
        await courseService.updateCourse(token, selectedCourse.id, dataToSubmit);
        notify("success", "Course updated successfully.");
      } else {
        await courseService.createCourse(token, dataToSubmit);
        notify("success", "Course created successfully.");
      }
      setIsCourseFormOpen(false);
      fetchCourses(isEditMode ? currentPage : 1);
    } catch (err) {
      notify("error", "Error", handleServerErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedCourse || !token) return;
    setIsDeleting(true);
    try {
      await courseService.deleteCourse(token, selectedCourse.id);
      notify("success", "Course deleted successfully.");
      setIsDeleteOpen(false);
      const newPage =
        courses.length === 1 && currentPage > 1 ? currentPage - 1 : currentPage;
      fetchCourses(newPage);
      setSelectedCourse(null);
    } catch (err) {
      notify("error", "Error", handleServerErrorMessage(err));
    } finally {
      setIsDeleting(false);
    }
  };

  const handleTogglePublish = async (course: Course) => {
    if (!token) return;
    setIsToggling(course.id);
    try {
      const updatedStatus = !course.isPublished;
      await courseService.togglePublish(token, course.id, {
        isPublished: updatedStatus,
      });
      notify(
        "success",
        `Course ${updatedStatus ? "published" : "unpublished"}.`
      );
      fetchCourses(currentPage);
    } catch (err) {
      notify("error", "Error", handleServerErrorMessage(err));
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
      notify("warning", `"${duplicate.name}" already exists.`);
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
      await fetchCategories();
      notify("success", `"${newCategoryName.trim()}" added.`);
    } catch (err) {
      notify("error", "Error", handleServerErrorMessage(err));
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
      notify("success", `"${cat.name}" deleted.`);
    } catch (err) {
      notify("error", "Error", handleServerErrorMessage(err));
    } finally {
      setDeletingCategoryId(null);
    }
  };

  const renderCourseGrid = () => (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {courses.map((course) => (
        <article
          key={course.id}
          className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
        >
          <img
            src={course.thumbnail || "/placeholder-image.png"}
            alt={course.title}
            className="h-40 w-full object-cover"
          />
          <div className="space-y-3 p-5">
            <div className="flex items-start justify-between gap-3">
              <h3 className="line-clamp-2 text-base font-semibold text-slate-900">
                {course.title}
              </h3>
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${statusBadgeClass(
                  course.isPublished
                )}`}
              >
                {course.isPublished ? "Published" : "Draft"}
              </span>
            </div>

            <p className="text-xs text-slate-500">
              Instructor: {course.instructor?.firstName}{" "}
              {course.instructor?.lastName || "N/A"}
            </p>

            <div className="flex flex-wrap gap-2">
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  difficultyClasses[course.difficulty || "BEGINNER"] ||
                  "bg-slate-100 text-slate-700"
                }`}
              >
                {course.difficulty || "BEGINNER"}
              </span>
              {course.category ? (
                <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
                  {course.category.name}
                </span>
              ) : null}
              {course.isFeatured ? (
                <span className="rounded-full bg-violet-100 px-3 py-1 text-xs font-semibold text-violet-700">
                  Featured
                </span>
              ) : null}
            </div>

            <p className="line-clamp-3 text-sm leading-6 text-slate-600">
              {course.description}
            </p>

            <div className="flex items-center justify-between border-t border-slate-100 pt-3">
              <label
                title="Toggle Publish Status"
                className="inline-flex items-center gap-2 text-sm text-slate-600"
              >
                <input
                  type="checkbox"
                  checked={course.isPublished}
                  onChange={() => handleTogglePublish(course)}
                  disabled={isToggling === course.id}
                  className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                Publish
              </label>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  title="View Details"
                  onClick={() => handleViewDetailsClick(course)}
                  className="rounded-full p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
                >
                  <FiEye className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  title="Edit Course"
                  onClick={() => handleEditCourseClick(course)}
                  className="rounded-full p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
                >
                  <FiEdit2 className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  title="Delete Course"
                  onClick={() => handleDeleteClick(course)}
                  className="rounded-full p-2 text-red-500 transition hover:bg-red-50 hover:text-red-700"
                >
                  <FiTrash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </article>
      ))}
    </div>
  );

  const renderCourseList = () => (
    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className="hidden grid-cols-[minmax(220px,3fr)_repeat(5,minmax(0,1fr))_auto] gap-4 border-b border-slate-200 px-4 py-4 text-sm font-semibold text-slate-500 lg:grid">
        <span>Title</span>
        <span>Instructor</span>
        <span>Category</span>
        <span>Difficulty</span>
        <span>Enrollments</span>
        <span>Status</span>
        <span>Actions</span>
      </div>
      {courses.map((course) => (
        <div
          key={course.id}
          className="border-b border-slate-100 px-4 py-4 last:border-b-0"
        >
          <div className="space-y-4 lg:grid lg:grid-cols-[minmax(220px,3fr)_repeat(5,minmax(0,1fr))_auto] lg:items-center lg:gap-4 lg:space-y-0">
            <div className="font-medium text-slate-900" title={course.title}>
              {course.title}
            </div>
            <div className="text-sm text-slate-600">
              {course.instructor?.firstName} {course.instructor?.lastName || "N/A"}
            </div>
            <div>
              <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
                {course.category?.name || "N/A"}
              </span>
            </div>
            <div>
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  difficultyClasses[course.difficulty || "BEGINNER"] ||
                  "bg-slate-100 text-slate-700"
                }`}
              >
                {course.difficulty || "BEGINNER"}
              </span>
            </div>
            <div className="text-sm text-slate-600">
              {course._count?.enrollments ?? 0}
            </div>
            <div className="flex items-center gap-3">
              <label className="inline-flex items-center gap-2 text-sm text-slate-600">
                <input
                  type="checkbox"
                  checked={course.isPublished}
                  onChange={() => handleTogglePublish(course)}
                  disabled={isToggling === course.id}
                  className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                {course.isPublished ? "Published" : "Draft"}
              </label>
              {course.isFeatured ? (
                <FiStar className="h-4 w-4 text-violet-500" />
              ) : null}
            </div>
            <div className="flex items-center justify-end gap-1">
              <button
                type="button"
                title="View Details"
                onClick={() => handleViewDetailsClick(course)}
                className="rounded-full p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
              >
                <FiEye className="h-4 w-4" />
              </button>
              <button
                type="button"
                title="Edit Course"
                onClick={() => handleEditCourseClick(course)}
                className="rounded-full p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
              >
                <FiEdit2 className="h-4 w-4" />
              </button>
              <button
                type="button"
                title="Delete Course"
                onClick={() => handleDeleteClick(course)}
                className="rounded-full p-2 text-red-500 transition hover:bg-red-50 hover:text-red-700"
              >
                <FiTrash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-3xl font-semibold text-slate-900">Manage Courses</h1>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => setIsCategoryModalOpen(true)}
            className={`${buttonClassName} border border-slate-200 text-slate-700 hover:bg-slate-50`}
          >
            <FiTag className="h-4 w-4" />
            Manage Categories
          </button>
          <button
            type="button"
            onClick={handleAddCourseClick}
            className={`${buttonClassName} bg-blue-600 text-white hover:bg-blue-700`}
          >
            <FiPlus className="h-4 w-4" />
            Add New Course
          </button>
        </div>
      </div>

      <div className="mt-6 grid gap-4 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-2 xl:grid-cols-5">
        <div className="relative">
          <FiSearch className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            placeholder="Search courses..."
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            className={`${inputClassName} pl-11`}
          />
        </div>

        <select
          value={categoryFilter}
          onChange={(event) => setCategoryFilter(event.target.value)}
          className={inputClassName}
        >
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>

        <select
          value={difficultyFilter}
          onChange={(event) => setDifficultyFilter(event.target.value)}
          className={inputClassName}
        >
          <option value="">All Difficulties</option>
          <option value="BEGINNER">Beginner</option>
          <option value="INTERMEDIATE">Intermediate</option>
          <option value="ADVANCED">Advanced</option>
          <option value="EXPERT">Expert</option>
        </select>

        <select
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
          className={inputClassName}
        >
          <option value="">All Statuses</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
          <option value="featured">Featured</option>
        </select>

        <div className="flex items-center justify-start gap-2 xl:justify-end">
          <button
            type="button"
            title="Grid View"
            onClick={() => setViewType("grid")}
            className={viewButtonClassName(viewType === "grid")}
          >
            <FiGrid className="h-4 w-4" />
          </button>
          <button
            type="button"
            title="List View"
            onClick={() => setViewType("list")}
            className={viewButtonClassName(viewType === "list")}
          >
            <FiList className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="mt-6">
        {isLoading ? (
          <div className="flex min-h-[300px] items-center justify-center rounded-3xl border border-slate-200 bg-white text-sm text-slate-500 shadow-sm">
            Loading courses...
          </div>
        ) : courses.length > 0 ? (
          <>
            {viewType === "grid" ? renderCourseGrid() : renderCourseList()}
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={(newPage) => fetchCourses(newPage)}
            />
          </>
        ) : (
          <p className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 px-6 py-12 text-center text-sm text-slate-500">
            No courses found matching your criteria.
          </p>
        )}
      </div>

      <CourseFormModal
        isOpen={isCourseFormOpen}
        onClose={() => setIsCourseFormOpen(false)}
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
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        handleDeleteCourse={handleConfirmDelete}
        selectedCourse={selectedCourse}
        isLoading={isDeleting}
      />

      <DetailsDrawer
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        selectedCourse={selectedCourse}
        handleEditCourse={handleEditCourseClick}
      />

      <Modal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        size="sm"
        title="Manage Categories"
        footer={
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => setIsCategoryModalOpen(false)}
              className="inline-flex items-center justify-center rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Close
            </button>
          </div>
        }
      >
        <div className="space-y-6">
          <div className="space-y-3">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Category name
              </label>
              <input
                placeholder="e.g. Entrepreneurship"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleCreateCategory();
                }}
                className={inputClassName}
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Description{" "}
                <span className="font-normal text-slate-400">(optional)</span>
              </label>
              <input
                placeholder="Short description"
                value={newCategoryDesc}
                onChange={(e) => setNewCategoryDesc(e.target.value)}
                className={inputClassName}
              />
            </div>

            <button
              type="button"
              disabled={!newCategoryName.trim() || isCreatingCategory}
              onClick={handleCreateCategory}
              className={`${buttonClassName} bg-blue-600 text-white hover:bg-blue-700`}
            >
              <FiPlus className="h-4 w-4" />
              {isCreatingCategory ? "Adding..." : "Add Category"}
            </button>
          </div>

          <div className="border-t border-slate-200 pt-5">
            <p className="mb-3 text-sm font-semibold text-slate-500">
              Existing categories ({categories.length})
            </p>
            {categories.length === 0 ? (
              <p className="text-sm text-slate-400">None yet.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => (
                  <span
                    key={cat.id}
                    className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-2 text-sm font-medium text-blue-700"
                  >
                    {cat.name}
                    <button
                      type="button"
                      disabled={deletingCategoryId === cat.id}
                      onClick={() => handleDeleteCategory(cat)}
                      className="rounded-full p-0.5 text-blue-500 transition hover:bg-blue-100 hover:text-blue-700 disabled:opacity-60"
                    >
                      <FiTrash2 className="h-3.5 w-3.5" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AdminCoursesPage;

import React from "react";
import Image from "next/image";
import { FiEdit2, FiPlus } from "react-icons/fi";
import { Category } from "@/services/api";
import { Modal } from "@/components/ui/Overlay";

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

const labelClassName = "mb-2 block text-sm font-medium text-slate-700";
const inputClassName =
  "w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500";

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
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="lg"
      title={isEditMode ? "Edit Course" : "Add New Course"}
      footer={
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center justify-center rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isLoading}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isEditMode ? <FiEdit2 className="h-4 w-4" /> : <FiPlus className="h-4 w-4" />}
            {isLoading
              ? isEditMode
                ? "Updating..."
                : "Creating..."
              : isEditMode
              ? "Update Course"
              : "Create Course"}
          </button>
        </div>
      }
    >
      <div className="space-y-5">
        <div>
          <label className={labelClassName}>Course Title</label>
          <input
            name="title"
            value={formData.title}
            onChange={handleFormChange}
            placeholder="Enter course title"
            className={inputClassName}
          />
        </div>

        <div>
          <label className={labelClassName}>Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleFormChange}
            placeholder="Brief description of the course"
            rows={4}
            className={`${inputClassName} resize-none`}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className={labelClassName}>Category</label>
            <select
              name="categoryId"
              value={formData.categoryId || ""}
              onChange={handleFormChange}
              disabled={categoriesLoading || categories.length === 0}
              className={inputClassName}
            >
              <option value="">
                {categoriesLoading
                  ? "Loading categories..."
                  : categories.length === 0
                  ? "No categories available"
                  : "Select category"}
              </option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={labelClassName}>Difficulty Level</label>
            <select
              name="difficulty"
              value={formData.difficulty}
              onChange={handleFormChange}
              className={inputClassName}
            >
              <option value="BEGINNER">Beginner</option>
              <option value="INTERMEDIATE">Intermediate</option>
              <option value="ADVANCED">Advanced</option>
              <option value="EXPERT">Expert</option>
            </select>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className={labelClassName}>Duration (Hours)</label>
            <input
              name="durationHours"
              type="number"
              value={formData.durationHours}
              onChange={handleFormChange}
              min={0}
              className={inputClassName}
            />
          </div>

          <div>
            <label className={labelClassName}>Instructor ID</label>
            <input
              name="instructorId"
              type="number"
              value={formData.instructorId}
              onChange={handleFormChange}
              min={0}
              className={inputClassName}
            />
          </div>
        </div>

        <div>
          <label className={labelClassName}>Thumbnail Image</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => handleFileChange(e, "thumbnail")}
            className="block w-full text-sm text-slate-500 file:mr-4 file:rounded-lg file:border-0 file:bg-slate-100 file:px-4 file:py-2 file:font-medium file:text-slate-700 hover:file:bg-slate-200"
          />
          {thumbnailPreview ? (
            <div className="relative mt-3 h-28 w-40 overflow-hidden rounded-xl border border-slate-200">
              <Image
                src={thumbnailPreview}
                alt="Thumbnail preview"
                fill
                unoptimized
                className="object-cover"
              />
            </div>
          ) : null}
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="flex items-center justify-between rounded-2xl border border-slate-200 px-4 py-3">
            <span className="text-sm font-medium text-slate-700">Published?</span>
            <input
              id="isPublished"
              name="isPublished"
              type="checkbox"
              checked={formData.isPublished === 1}
              onChange={(e) =>
                handleCheckboxChange("isPublished", e.target.checked)
              }
              className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
            />
          </label>

          <label className="flex items-center justify-between rounded-2xl border border-slate-200 px-4 py-3">
            <span className="text-sm font-medium text-slate-700">Featured?</span>
            <input
              id="isFeatured"
              name="isFeatured"
              type="checkbox"
              checked={formData.isFeatured === 1}
              onChange={(e) =>
                handleCheckboxChange("isFeatured", e.target.checked)
              }
              className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
            />
          </label>
        </div>
      </div>
    </Modal>
  );
};

export default CourseFormModal;

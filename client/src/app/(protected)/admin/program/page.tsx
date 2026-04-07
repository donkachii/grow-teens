"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { FiEdit2, FiPlus, FiTrash2, FiLayers } from "react-icons/fi";
import { IoCloudUploadOutline } from "react-icons/io5";
import { toast } from "react-toastify";
import { useSession } from "next-auth/react";

import { NextAuthUserSession, Course } from "@/types";
import { handleServerErrorMessage } from "@/utils";
import { programService, courseService, Program } from "@/services/api";
import { Modal } from "@/components/ui/Overlay";

const MAX_FILE_SIZE = 10 * 1024 * 1024;

interface ProgramFormInputs {
  title: string;
  description: string;
  isPublished: boolean;
  image?: FileList;
}

const inputClassName =
  "w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500";

const ProgramManagement = () => {
  const [isProgramModalOpen, setIsProgramModalOpen] = useState(false);
  const [isCoursesModalOpen, setIsCoursesModalOpen] = useState(false);

  const [programs, setPrograms] = useState<Program[]>([]);
  const [availableCourses, setAvailableCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [thumbnailPreview, setThumbnailPreview] = useState<string>("");

  const [selectedCourseId, setSelectedCourseId] = useState<string>("");
  const [isAddingCourse, setIsAddingCourse] = useState(false);
  const [removingCourseId, setRemovingCourseId] = useState<number | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const { data: sessionData } = useSession() as {
    data: NextAuthUserSession | null;
  };
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
      toast.error("File too large. Max size is 10 MB.");
      return;
    }
    setThumbnailPreview(URL.createObjectURL(file));
  };

  const handleOpenCreate = () => {
    setIsEditMode(false);
    setSelectedProgram(null);
    setThumbnailPreview("");
    reset({ title: "", description: "", isPublished: false });
    setIsProgramModalOpen(true);
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
    setIsProgramModalOpen(true);
  };

  const handleOpenManageCourses = (program: Program) => {
    setSelectedProgram(program);
    setSelectedCourseId("");
    setIsCoursesModalOpen(true);
  };

  const onSubmit: SubmitHandler<ProgramFormInputs> = async (data) => {
    if (!token) return;
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("title", data.title);
      formData.append("description", data.description);
      formData.append("isPublished", data.isPublished ? "1" : "0");

      if (data.image?.[0]) formData.append("image", data.image[0]);

      if (isEditMode && selectedProgram) {
        await programService.updateProgram(token, selectedProgram.id, formData);
        toast.success("Program updated.");
      } else {
        await programService.createProgram(token, formData);
        toast.success("Program created.");
      }

      setIsProgramModalOpen(false);
      reset();
      setThumbnailPreview("");
      fetchPrograms();
    } catch (err) {
      toast.error(handleServerErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (program: Program) => {
    if (!token) return;
    if (!confirm(`Delete "${program.title}"? This cannot be undone.`)) return;
    try {
      await programService.deleteProgram(token, program.id);
      toast.success("Program deleted.");
      fetchPrograms();
    } catch (err) {
      toast.error(handleServerErrorMessage(err));
    }
  };

  const handleAddCourse = async () => {
    if (!token || !selectedProgram || !selectedCourseId) return;
    setIsAddingCourse(true);
    try {
      const res = await programService.addCourse(token, selectedProgram.id, {
        courseId: +selectedCourseId,
      });
      const link = (res as any)?.data;
      setSelectedProgram((prev) =>
        prev ? { ...prev, courses: [...prev.courses, link] } : prev
      );
      setPrograms((prev) =>
        prev.map((p) =>
          p.id === selectedProgram.id ? { ...p, courses: [...p.courses, link] } : p
        )
      );
      setSelectedCourseId("");
      toast.success("Course added to program.");
    } catch (err) {
      toast.error(handleServerErrorMessage(err));
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
        prev.map((p) => (p.id === selectedProgram.id ? { ...p, courses: updated } : p))
      );
      toast.success("Course removed.");
    } catch (err) {
      toast.error(handleServerErrorMessage(err));
    } finally {
      setRemovingCourseId(null);
    }
  };

  const unassignedCourses = availableCourses.filter(
    (c) => !selectedProgram?.courses.some((pc) => pc.course.id === c.id)
  );

  const imageRegistration = register("image");

  return (
    <div className="min-h-screen bg-slate-50 px-6 py-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-3xl font-semibold text-slate-900">Program Management</h1>
        <button
          type="button"
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
        >
          <FiPlus className="h-4 w-4" />
          Add New Program
        </button>
      </div>

      <div className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        {isLoading ? (
          <div className="py-10 text-center text-sm text-slate-500">Loading programs...</div>
        ) : fetchError ? (
          <div className="flex flex-col items-center gap-4 py-10 text-center">
            <p className="text-sm text-red-600">{fetchError}</p>
            <button
              type="button"
              onClick={fetchPrograms}
              className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Try Again
            </button>
          </div>
        ) : programs.length === 0 ? (
          <p className="py-10 text-center text-sm text-slate-500">
            No programs yet. Click &quot;Add New Program&quot; to get started.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-slate-200 text-slate-500">
                <tr>
                  <th className="px-3 py-3 font-medium">#</th>
                  <th className="px-3 py-3 font-medium">Title</th>
                  <th className="px-3 py-3 font-medium">Description</th>
                  <th className="px-3 py-3 font-medium">Courses</th>
                  <th className="px-3 py-3 font-medium">Status</th>
                  <th className="px-3 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {programs.map((program, idx) => (
                  <tr key={program.id} className="border-b border-slate-100">
                    <td className="px-3 py-4 text-slate-600">{idx + 1}</td>
                    <td className="px-3 py-4 font-medium text-slate-900">{program.title}</td>
                    <td className="max-w-[320px] px-3 py-4 text-sm text-slate-600">
                      <p className="line-clamp-2">{program.description}</p>
                    </td>
                    <td className="px-3 py-4">
                      <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
                        {program.courses?.length ?? 0} courses
                      </span>
                    </td>
                    <td className="px-3 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          program.isPublished
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        {program.isPublished ? "Published" : "Draft"}
                      </span>
                    </td>
                    <td className="px-3 py-4">
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          title="Manage Courses"
                          onClick={() => handleOpenManageCourses(program)}
                          className="rounded-full p-2 text-violet-600 transition hover:bg-violet-50"
                        >
                          <FiLayers className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          title="Edit Program"
                          onClick={() => handleOpenEdit(program)}
                          className="rounded-full p-2 text-slate-600 transition hover:bg-slate-100"
                        >
                          <FiEdit2 className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          title="Delete Program"
                          onClick={() => handleDelete(program)}
                          className="rounded-full p-2 text-red-500 transition hover:bg-red-50"
                        >
                          <FiTrash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal
        isOpen={isProgramModalOpen}
        onClose={() => setIsProgramModalOpen(false)}
        size="lg"
        title={isEditMode ? "Edit Program" : "Add New Program"}
        footer={
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => setIsProgramModalOpen(false)}
              className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="program-form"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60"
            >
              {isEditMode ? <FiEdit2 className="h-4 w-4" /> : <FiPlus className="h-4 w-4" />}
              {isSubmitting
                ? isEditMode
                  ? "Saving..."
                  : "Creating..."
                : isEditMode
                ? "Save Changes"
                : "Create Program"}
            </button>
          </div>
        }
      >
        <form id="program-form" onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Title</label>
            <input
              {...register("title", { required: "Title is required" })}
              placeholder="Program title"
              className={inputClassName}
            />
            {errors.title ? (
              <p className="mt-2 text-sm text-red-600">{errors.title.message}</p>
            ) : null}
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Description
            </label>
            <textarea
              {...register("description", { required: "Description is required" })}
              placeholder="What is this program about?"
              rows={4}
              className={`${inputClassName} resize-none`}
            />
            {errors.description ? (
              <p className="mt-2 text-sm text-red-600">
                {errors.description.message}
              </p>
            ) : null}
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Thumbnail Image
            </label>
            <div
              className="rounded-2xl border-2 border-dashed border-slate-200 p-5 text-center"
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const file = e.dataTransfer.files?.[0];
                if (!file) return;
                if (file.size > MAX_FILE_SIZE) {
                  toast.error("File too large. Max 10 MB");
                  return;
                }
                setThumbnailPreview(URL.createObjectURL(file));
              }}
            >
              <input
                type="file"
                accept="image/*"
                className="hidden"
                {...imageRegistration}
                ref={(element) => {
                  imageRegistration.ref(element);
                  fileInputRef.current = element;
                }}
                onChange={(e) => {
                  imageRegistration.onChange(e);
                  handleFileChange(e);
                }}
              />
              {thumbnailPreview ? (
                <img
                  src={thumbnailPreview}
                  alt="Thumbnail preview"
                  className="mx-auto max-h-[160px] rounded-xl object-cover"
                />
              ) : (
                <div className="space-y-2 text-slate-400">
                  <IoCloudUploadOutline className="mx-auto h-8 w-8" />
                  <p className="text-sm">
                    <span className="font-semibold text-blue-600">Click to upload</span>{" "}
                    or drag and drop
                  </p>
                  <p className="text-xs">PNG, JPG, WEBP — max 10 MB</p>
                </div>
              )}
            </div>
          </div>

          <label className="flex items-center justify-between rounded-2xl border border-slate-200 px-4 py-3">
            <span className="text-sm font-medium text-slate-700">
              Publish immediately?
            </span>
            <input
              type="checkbox"
              {...register("isPublished")}
              className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
            />
          </label>
        </form>
      </Modal>

      <Modal
        isOpen={isCoursesModalOpen}
        onClose={() => setIsCoursesModalOpen(false)}
        size="lg"
        title={`Manage Courses — ${selectedProgram?.title || ""}`}
        footer={
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => setIsCoursesModalOpen(false)}
              className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Done
            </button>
          </div>
        }
      >
        <div className="space-y-5">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Add a course
            </label>
            <div className="flex flex-col gap-3 sm:flex-row">
              <select
                value={selectedCourseId}
                onChange={(e) => setSelectedCourseId(e.target.value)}
                className={inputClassName}
              >
                <option value="">Select course...</option>
                {unassignedCourses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title}
                  </option>
                ))}
              </select>
              <button
                type="button"
                disabled={!selectedCourseId || isAddingCourse}
                onClick={handleAddCourse}
                className="rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60"
              >
                {isAddingCourse ? "Adding..." : "Add"}
              </button>
            </div>
          </div>

          <div className="border-t border-slate-200 pt-5">
            <p className="mb-3 text-sm font-semibold text-slate-600">
              Courses in this program ({selectedProgram?.courses?.length ?? 0})
            </p>
            {selectedProgram?.courses?.length === 0 ? (
              <p className="py-4 text-center text-sm text-slate-400">
                No courses added yet.
              </p>
            ) : (
              <div className="space-y-2">
                {[...(selectedProgram?.courses ?? [])]
                  .sort((a, b) => a.orderNumber - b.orderNumber)
                  .map((pc) => (
                    <div
                      key={pc.id}
                      className="flex items-center justify-between rounded-2xl bg-slate-50 px-3 py-3"
                    >
                      <div className="flex items-center gap-3">
                        {pc.course.thumbnail ? (
                          <img
                            src={pc.course.thumbnail}
                            alt={pc.course.title}
                            className="h-10 w-10 rounded-xl object-cover"
                          />
                        ) : null}
                        <div>
                          <p className="text-sm font-medium text-slate-900">
                            {pc.course.title}
                          </p>
                          <p className="text-xs text-slate-400">
                            Order: {pc.orderNumber}
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        disabled={removingCourseId === pc.course.id}
                        onClick={() => handleRemoveCourse(pc.course.id)}
                        className="rounded-full p-2 text-red-500 transition hover:bg-red-50 disabled:opacity-60"
                      >
                        <FiTrash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ProgramManagement;
